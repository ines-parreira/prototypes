import _take from 'lodash/take'
import _takeRight from 'lodash/takeRight'
import _findIndex from 'lodash/findIndex'
import _pick from 'lodash/pick'
import {fromJS} from 'immutable'
import {convertFromHTML} from 'draft-convert'
import {convertToRaw, convertFromRaw, ContentState, SelectionState} from 'draft-js'

import ticketReplyCache from './ticketReplyCache'
import {renderTemplate} from '../../pages/common/utils/template'

const signatureHTMLPrefix = '<div></div><div></div>'
const signatureTextPrefix = '\n\n'

/**
 * Test if a signature was already add to our content to avoid adding it twice
 *
 * @param contentState
 * @param currentUser
 */
export const isSignatureAdded = (contentState, currentUser = fromJS({})) => (
    contentState.getPlainText().includes(`${signatureTextPrefix}${currentUser.get('signature_text')}`)
)

/**
 * Test if the contentState only has the signature and nothing else
 *
 * @param contentState
 * @param currentUser
 */
export const onlySignature = (contentState, currentUser = fromJS({})) => {
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
export const getCache = (context) => {
    const {contentState, action} = context

    // Proceed only if the change didn't come from a macro
    if (action.fromMacro) {
        return context
    }

    // We're fetching the cached state from the localStorage here
    if (!contentState) {
        const cachedContent = ticketReplyCache.get(action.ticketId)
        if (cachedContent && !cachedContent.isEmpty()) {
            const cachedContentState = cachedContent.get('contentState')
            if (cachedContentState) {
                context.contentState = convertFromRaw(cachedContentState.toJS())
                const cachedSelectionState = cachedContent.get('selectionState')
                if (cachedSelectionState) {
                    // create a new selection and just copy the props from the cached state
                    context.selectionState = SelectionState.createEmpty().merge(cachedSelectionState)
                }
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
export const updateCache = (context) => {
    const {contentState, selectionState, appliedMacro, action} = context
    // We're storing the content state in a persistent storage so we can keep it after page refresh
    if (
        (contentState && contentState.hasText() && !onlySignature(contentState, action.currentUser)) ||
        appliedMacro
    ) {
        // TODO (@xarg): We also need to keep the attachments in the cache
        ticketReplyCache.set(action.ticketId, {
            contentState: convertToRaw(contentState),
            selectionState
        })
    } else {
        // we're deleting the data from cache so we don't explode the storage
        ticketReplyCache.delete(action.ticketId)
    }
}

/**
 * Return a selectionState before the first ContentBlock
 *
 * @param blocks
 * @private
 */
const _selectionBefore = (blocks) => {
    if (blocks && blocks.length) {
        // we only want the first block, we put the selection just before it
        return SelectionState.createEmpty(blocks[0].key)
    }
    return null
}

/**
 * Return a selectionState after the last ContentBlock
 * @param blocks
 * @private
 */
const _selectionAfter = (blocks) => {
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
const _markSignatureAdded = (context) => {
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
export const addSignature = (context) => {
    const {action, state, contentState, selectionState} = context

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
    if (signatureHTML) {
        signatureBlocks = convertFromHTML(`${signatureHTMLPrefix}${signatureHTML}`).getBlocksAsArray()
    } else if (signatureText) {
        signatureBlocks = ContentState.createFromText(`${signatureTextPrefix}${signatureText}`).getBlocksAsArray()
    }

    if (!signatureBlocks) {
        return context
    }

    let existingBlocks = []
    if (contentState) {
        existingBlocks = contentState.getBlocksAsArray()
    }

    // Concat the signature blocks at the end of the content
    context.contentState = ContentState.createFromBlockArray(existingBlocks.concat(signatureBlocks))

    // Set the position of the cursor just before the signature. Only if we don't already have a selection state!
    if (!selectionState) {
        context.selectionState = _selectionBefore(context.contentState.getBlocksAsArray())
    }
    context.forceUpdate = true

    return _markSignatureAdded(context)
}

/**
 * Add macro text and return the new editor state (contentState and selectionState).
 *
 * @param context
 * @returns {*}
 */
export const applyMacro = (context) => {
    const {contentState, selectionState, action, state} = context

    // Only when it's from a macro
    if (!action.fromMacro) {
        return context
    }

    const ticketState = state.toJS()
    const currentUser = _pick(action.currentUser.toJS(), ['name', 'firstname', 'lastname', 'email'])

    const text = renderTemplate(action.args.get('body_text', ''), {
        ticket: ticketState,
        current_user: currentUser
    })

    const html = renderTemplate(action.args.get('body_html', ''), {
        ticket: ticketState,
        current_user: currentUser
    })

    let blocks = []
    if (text) {
        blocks = ContentState.createFromText(text).getBlocksAsArray()
    } else {
        blocks = convertFromHTML(html).getBlocksAsArray()
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

    return context
}
