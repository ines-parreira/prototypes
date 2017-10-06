// @flow
import _take from 'lodash/take'
import _takeRight from 'lodash/takeRight'
import _findIndex from 'lodash/findIndex'
import _pick from 'lodash/pick'
import _pickBy from 'lodash/pickBy'
import {fromJS} from 'immutable'
import {convertFromHTML} from '../../utils'
import {isRichType} from '../../config/ticket'
import {convertToRaw, convertFromRaw, ContentState, SelectionState} from 'draft-js'

import ticketReplyCache from './ticketReplyCache'
import {renderTemplate} from '../../pages/common/utils/template'
import * as selectors from './selectors'

const signatureHTMLPrefix = '<div></div><div></div>'
const signatureTextPrefix = '\n\n'

import type {Map} from 'immutable'
import type {currentUserType} from '../types'
type contextType = {
    action: {
        fromMacro: boolean,
        ticketId: string,
        currentUser: currentUserType,
        ticket: Map<*,*>,
        args: Map<*,*>
    },
    appliedMacro: {},
    contentState: ContentState,
    forceUpdate: boolean,
    forceFocus: boolean,
    state: Map<*,*>,
    signatureAdded?: boolean,
    cacheAdded?: boolean,
    selectionState?: SelectionState,
}
type rawType = {
    blocks: Array<*>,
    entityMap: {}
}

/**
 * Test if a signature was already add to our content to avoid adding it twice
 *
 * @param contentState
 * @param currentUser
 */
export const isSignatureAdded = (contentState: ContentState, currentUser: currentUserType = fromJS({})): boolean => (
    contentState.getPlainText().includes(`${signatureTextPrefix}${currentUser.get('signature_text')}`)
)

/**
 * Test if the contentState only has the signature and nothing else
 *
 * @param contentState
 * @param currentUser
 */
export const onlySignature = (contentState: ContentState, currentUser: currentUserType = fromJS({})): boolean => {
    if (!contentState) {
        return false
    }

    return `${signatureTextPrefix}${currentUser.get('signature_text')}` === contentState.getPlainText()
}

/**
 * Get the initial editor state (contentState + selectionState) from cache or return an empty state
 *
 * @param context
 * @returns {*}
 */
export const getCache = (context: contextType): contextType => {
    const {action} = context

    // Proceed only if the change didn't come from a macro
    if (action.fromMacro) {
        return context
    }

    // We're fetching the cached state from the localStorage here
    const cachedContent = ticketReplyCache.get(action.ticketId)
    if (cachedContent && !cachedContent.isEmpty()) {
        const cachedContentState = cachedContent.get('contentState')
        if (cachedContentState) {
            context.contentState = convertFromRaw(cachedContentState.toJS())
            context.forceUpdate = true
            context.forceFocus = true
            const cachedSelectionState = cachedContent.get('selectionState')
            if (cachedSelectionState) {
                // create a new selection and just copy the props from the cached state
                context.selectionState = SelectionState.createEmpty().merge(cachedSelectionState)
            }
        }
    }

    return context
}

/**
 * Update the cache by saving the contentState and selectionState
 *
 * @param context
 */
export const updateCache = (context: contextType) => {
    const {contentState, selectionState, appliedMacro, action} = context
    // We're storing the content state in a persistent storage so we can keep it after page refresh
    if (
        (contentState && contentState.hasText() && !onlySignature(contentState, action.currentUser)) ||
        appliedMacro
    ) {
        // TODO (@xarg): We also need to keep the attachments in the cache
        ticketReplyCache.set(action.ticketId, {
            contentState: convertToRawWithoutMentions(contentState),
            selectionState
        })
    } else {
        // we're deleting the data from cache so we don't explode the storage
        ticketReplyCache.delete(action.ticketId)
    }
}

/**
 * Return a raw content state without any mention entities
 *
 * @param contentState
 * @return {{blocks: Array, entityMap: {}}}
 */
export const convertToRawWithoutMentions = (contentState: ContentState): rawType => {
    // We don't store mentions in cache because when we fetch the message from cache,
    // the mention entity would be applied even if the ticket channel is not private

    const rawContent = convertToRaw(contentState)
    let newRaw = {blocks: [], entityMap: {}}

    newRaw.blocks = rawContent.blocks.slice()
    newRaw.entityMap = _pickBy(rawContent.entityMap, (val) => {
        return val.type !== 'mention'
    })

    return newRaw
}

/**
 * Mark the context with cache added fields so we don't add the cache twice
 *
 * @param context
 * @returns {*}
 * @private
 */
const _markCacheAdded = (context: contextType): contextType => {
    context.cacheAdded = true
    context.state = context.state.setIn(['state', 'cacheAdded'], true)
    return context
}

/**
 * Add a cache (if any) as the content state
 *
 * @param context
 * @returns {*}
 */
export const addCache = (context: contextType): contextType => {
    const {state} = context

    context.cacheAdded = state.getIn(['state', 'cacheAdded'], false)

    if (context.cacheAdded) {
        return _markCacheAdded(context)
    }

    context = getCache(context)

    return _markCacheAdded(context)
}

/**
 * Return a selectionState before the first ContentBlock
 *
 * @param blocks
 * @private
 */
// const _selectionBefore = (blocks) => {
//     if (blocks && blocks.length) {
//         // we only want the first block, we put the selection just before it
//         return SelectionState.createEmpty(blocks[0].key)
//     }
//     return null
// }

/**
 * Return a selectionState after the last ContentBlock
 * @param blocks
 * @private
 */
const _selectionAfter = (blocks: Array<{key: string, text: string}>) => {
    if (blocks && blocks.length) {
        // we only want the last block, we put the selection after it
        const block = blocks.slice(-1)[0]
        return SelectionState.createEmpty(block.key).merge({
            focusOffset: block.text.length,
            anchorOffset: block.text.length
        })
    }
    return null
}

/**
 * Mark the context with signature added fields so we don't add the signature twice
 *
 * @param context
 * @returns {*}
 * @private
 */
const _markSignatureAdded = (context: contextType): contextType => {
    context.signatureAdded = true
    context.state = context.state.setIn(['state', 'signatureAdded'], true)
    return context
}

/**
 * Add a signature (if any) at the end of the content state
 *
 * @param context
 * @returns {*}
 */
export const addSignature = (context: contextType): contextType => {
    const {action, state, contentState} = context

    context.signatureAdded = state.getIn(['state', 'signatureAdded'], false)

    if (context.signatureAdded) {
        return _markSignatureAdded(context)
    }

    // Only add if we don't have any text already or we added from macro
    if (contentState && contentState.hasText() && !action.fromMacro) {
        return _markSignatureAdded(context)
    }

    // Only add if the we don't have the signature already
    if (contentState && isSignatureAdded(contentState, action.currentUser)) {
        return _markSignatureAdded(context)
    }

    let signatureBlocks = null
    const signatureHTML = action.currentUser.get('signature_html')
    const signatureText = action.currentUser.get('signature_text')
    if (signatureHTML && isRichType(selectors.getNewMessageType({newMessage: state}))) {
        signatureBlocks = convertFromHTML(`${signatureHTMLPrefix}${signatureHTML}`).getBlocksAsArray()
    } else if (signatureText) {
        signatureBlocks = ContentState.createFromText(`${signatureTextPrefix}${signatureText}`).getBlocksAsArray()
    }

    if (!signatureBlocks) {
        return context
    }

    // mark blocks with signature meta flag - useful later for removing it when switching to chat or internal note
    signatureBlocks = signatureBlocks.map((b) => b.set('data', fromJS({signature: true})))

    // Concat the signature blocks at the end of the content
    context.contentState = ContentState.createFromBlockArray(signatureBlocks)

    // TODO(@xarg): commented this out because we don't want to force the selection if a signature is set
    // Set the position of the cursor just before the signature. Only if we don't already have a selection state!
    // context.selectionState = _selectionBefore(context.contentState.getBlocksAsArray())
    context.forceUpdate = true

    return _markSignatureAdded(context)
}

/**
 * Add macro text and return the new editor state (contentState and selectionState).
 *
 * @param context
 * @returns {*}
 */
export const applyMacro = (context: contextType): contextType => {
    const {contentState, selectionState, action, state} = context

    // Only when it's from a macro
    if (!action.fromMacro) {
        return context
    }

    const ticketState = action.ticket.toJS()
    const currentUser = _pick(action.currentUser.toJS(), ['name', 'firstname', 'lastname', 'email'])

    const variables = {
        ticket: ticketState,
        current_user: currentUser
    }

    const text = renderTemplate(action.args.get('body_text', ''), variables)

    const html = renderTemplate(action.args.get('body_html', ''), variables)

    let blocks = []
    if (html && isRichType(selectors.getNewMessageType({newMessage: state}))) {
        blocks = convertFromHTML(html).getBlocksAsArray()
    } else {
        blocks = ContentState.createFromText(text).getBlocksAsArray()
    }

    if (contentState && contentState.hasText()) {
        const currBlocks = contentState.getBlocksAsArray()

        if (selectionState) {
            // Here we cut the current content at the cursor position to insert the macro.
            // Ex. : content is [1, 2, 3, 4, 5], we want to insert the macro ['a', 'b'] at index 2
            let idx = _findIndex(currBlocks, {key: selectionState.focusKey})

            // if the focusOffset is bigger than 0 it means that the cursor is not at the beginning of the block
            // so we have to add our macro after the block
            if (selectionState.focusOffset > 0) {
                idx += 1
            }

            // We first take the `index` first items (e.g. [1, 2])
            const left = _take(currBlocks, idx)
            // Then the `length - index` last items (e.g. [3, 4, 5])
            const right = _takeRight(currBlocks, currBlocks.length - idx)

            // Then we concat the new array to the left part, and the right part to the result of this
            // => [1, 2, 'a', 'b']
            blocks = left.concat(blocks)

            // Set the selection just after the macro content was inserted
            context.selectionState = _selectionAfter(blocks)

            // => [1, 2, 'a', 'b', 3, 4, 5]
            blocks = blocks.concat(right)
        } else {
            blocks = currBlocks.concat(blocks)

            // selection should be at the end here because we had no selection before
            context.selectionState = _selectionAfter(blocks)
        }
    } else {
        // selection should be at the end here because no content means no selection
        context.selectionState = _selectionAfter(blocks)
    }

    context.contentState = ContentState.createFromBlockArray(blocks)
    context.forceUpdate = true
    context.forceFocus = true

    return context
}
