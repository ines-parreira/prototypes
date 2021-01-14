import {
    ContentState,
    convertFromRaw,
    Modifier,
    SelectionState,
    ContentBlock,
} from 'draft-js'
import {fromJS, Map} from 'immutable'
import _findIndex from 'lodash/findIndex'
import _pick from 'lodash/pick'
import _take from 'lodash/take'
import _takeRight from 'lodash/takeRight'

import {TicketMessageSourceType} from '../../business/types/ticket'
import {isRichType} from '../../config/ticket'
import {renderTemplate} from '../../pages/common/utils/template.js'
import {convertFromHTML} from '../../utils/editor'
import {sanitizeHtmlForFacebookMessenger} from '../../utils/html'
import {CurrentUser, StoreState} from '../types'
import {convertToRawWithoutPredictions} from '../../pages/common/draftjs/plugins/prediction/utils.js'

import * as selectors from './selectors'
import ticketReplyCache from './ticketReplyCache'

const signatureHTMLPrefix = '<div></div><div></div>'
const signatureTextPrefix = '\n\n'

export type MessageContext = {
    action: {
        fromMacro: boolean
        ticketId: string
        currentUser: CurrentUser
        ticket: Map<any, any>
        args: Map<any, any>
        signature: Map<any, any>
    }
    appliedMacro?: Map<any, any>
    contentState: ContentState
    forceUpdate: boolean
    forceFocus: boolean
    state: Map<any, any>
    signatureAdded?: boolean
    cacheAdded?: boolean
    selectionState?: SelectionState
    sourceType?: string
}

export const getSignatureContentState = (
    signature: Map<any, any>
): ContentState => {
    let signatureBlocks: Maybe<ContentBlock[]> = null
    const text = signature.get('text') as Maybe<string>
    const html = signature.get('html') as Maybe<string>

    if (html) {
        signatureBlocks = convertFromHTML(
            `${signatureHTMLPrefix}${html}`
        ).getBlocksAsArray()
    } else if (text) {
        signatureBlocks = ContentState.createFromText(
            `${signatureTextPrefix}${text}`
        ).getBlocksAsArray()
    }

    if (!signatureBlocks) {
        return ContentState.createFromText('')
    }

    // mark blocks with signature meta flag - useful later for removing it when switching to chat or internal note
    signatureBlocks = signatureBlocks.map((b) =>
        b.set('data', fromJS({signature: true}))
    ) as ContentBlock[]

    // Concat the signature blocks at the end of the content
    return ContentState.createFromBlockArray(signatureBlocks)
}

// find a contentState in another contentState and return a selection state
function findContentState(
    parentContentState: ContentState,
    contentState: ContentState
): SelectionState {
    //@ts-ignore
    let selectionState = SelectionState.createEmpty()
    const parentBlocks = parentContentState.getBlocksAsArray()
    const blocks = contentState.getBlocksAsArray()
    const clearKeys = {
        key: '',
        characterList: [],
    }

    // find block array inside block array
    let j = 0
    parentBlocks.some((block) => {
        const key = block.getKey()
        if (block.merge(clearKeys).equals(blocks[j].merge(clearKeys))) {
            j++

            if (!selectionState.getAnchorKey()) {
                selectionState = selectionState.set(
                    'anchorKey',
                    key
                ) as SelectionState
            }

            if (j === blocks.length) {
                selectionState = selectionState.merge({
                    focusKey: key,
                    focusOffset: block.getLength(),
                }) as SelectionState
                return true
            }
        } else {
            // reset other index
            j = 0
        }
    })

    return selectionState
}

/**
 * Test if the given signature is in the content state
 */
export const isSignatureAdded = (
    contentState: Maybe<ContentState>,
    textSignature = ''
): boolean => {
    if (!contentState || !textSignature) {
        return false
    }

    return contentState
        .getPlainText()
        .includes(signatureTextPrefix + textSignature)
}
/**
 * Test if the contentState only has the signature and nothing else
 */
export const hasOnlySignature = (
    contentState: Maybe<ContentState>,
    textSignature: Maybe<string>
): boolean => {
    if (!contentState || !textSignature) {
        return false
    }
    return contentState.getPlainText() === signatureTextPrefix + textSignature
}

export const getSourceTypeCache = (
    ticketId: string
): TicketMessageSourceType => {
    return ticketReplyCache
        .get(ticketId)
        .get('sourceType') as TicketMessageSourceType
}

export const setSourceTypeCache = (
    ticketId: string,
    sourceType: string
): void => {
    return ticketReplyCache.set(ticketId, {sourceType})
}

export const deleteReplyCache = (ticketId: string): void => {
    return ticketReplyCache.delete(ticketId)
}

/**
 * Get the initial editor state (contentState + selectionState) from cache or return an empty state
 */
const getCache = (context: MessageContext): MessageContext => {
    const {action} = context

    // Proceed only if the change didn't come from a macro
    if (action.fromMacro) {
        return context
    }

    // We're fetching the cached state from the localStorage here
    const cachedContent = ticketReplyCache.get(action.ticketId)
    if (cachedContent && !cachedContent.isEmpty()) {
        const cachedContentState = cachedContent.get(
            'contentState'
        ) as ContentState
        if (cachedContentState) {
            context.contentState = convertFromRaw(cachedContentState.toJS())
            context.forceFocus = true
            context.forceUpdate = true
            context.signatureAdded = cachedContent.get('signatureAdded', false)
            const cachedSelectionState = cachedContent.get('selectionState')
            if (cachedSelectionState) {
                // create a new selection and just copy the props from the cached state
                //@ts-ignore
                context.selectionState = SelectionState.createEmpty().merge(
                    cachedSelectionState
                ) as SelectionState
            }
        }
    }

    return context
}

/**
 * Update the cache by saving the contentState and selectionState
 */
export const updateCache = (context: MessageContext) => {
    const {
        contentState,
        selectionState,
        appliedMacro,
        action,
        sourceType,
        signatureAdded,
    } = context
    const textSignature = action.signature ? action.signature.get('text') : ''

    // We're storing the content state in a persistent storage so we can keep it after page refresh
    if (
        (contentState &&
            contentState.hasText() &&
            !hasOnlySignature(contentState, textSignature)) ||
        appliedMacro
    ) {
        // TODO (@xarg): We also need to keep the attachments in the cache
        ticketReplyCache.set(action.ticketId, {
            selectionState,
            sourceType,
            signatureAdded,
            contentState: convertToRawWithoutPredictions(contentState),
        })
    } else {
        // we're deleting the data from cache so we don't explode the storage
        ticketReplyCache.delete(action.ticketId)
    }
}

/**
 * Mark the context with cache added fields so we don't add the cache twice
 */
const _markCacheAdded = (context: MessageContext): MessageContext => {
    context.cacheAdded = true
    context.state = context.state.setIn(['state', 'cacheAdded'], true)
    return context
}

/**
 * Add a cache (if any) as the content state
 */
export const addCache = (context: MessageContext): MessageContext => {
    const {state} = context

    context.cacheAdded = state.getIn(['state', 'cacheAdded'], false)

    if (context.cacheAdded) {
        return _markCacheAdded(context)
    }

    return _markCacheAdded(getCache(context))
}

/**
 * Return a selectionState before the first ContentBlock
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
 */
export const selectionAfter = (
    blocks: Array<{key: string; text: string}>
): Maybe<SelectionState> => {
    if (blocks && blocks.length) {
        // we only want the last block, we put the selection after it
        const block = blocks.slice(-1)[0]
        return SelectionState.createEmpty(block.key).merge({
            focusOffset: block.text.length,
            anchorOffset: block.text.length,
        }) as SelectionState
    }
    return null
}

/**
 * Add a signature (if any) at the end of the content state
 */
export const addSignature = (
    contentState: Maybe<ContentState>,
    signature: Map<any, any>
): Maybe<ContentState> => {
    if (!contentState) {
        return contentState
    }

    const signatureContentState = getSignatureContentState(signature)

    if (!signatureContentState.hasText()) {
        return contentState
    }

    // using contentState.getSelectionAfter inserts the signature at the start,
    // when the content is loaded from cache.
    const selectionState =
        selectionAfter(
            (contentState.getBlocksAsArray() as unknown) as {
                key: string
                text: string
            }[]
        ) || contentState.getSelectionAfter()
    // add the signature contentState at the end of the existing content
    return Modifier.replaceWithFragment(
        contentState,
        selectionState,
        signatureContentState.getBlockMap()
    )
}

/**
 * Remove the signature (if any) from the content state
 */
export const removeSignature = (
    contentState: ContentState,
    signature: Map<any, any>
): ContentState => {
    const signatureContentState = getSignatureContentState(signature)
    const selectionState = findContentState(contentState, signatureContentState)

    // check if selection is empty
    if (selectionState.getAnchorKey() && selectionState.getFocusKey()) {
        //@ts-ignore
        return Modifier.removeRange(contentState, selectionState)
    }

    return contentState
}

/**
 * Add macro text and return the new editor state (contentState and selectionState).
 */
export const applyMacro = (context: MessageContext): MessageContext => {
    const {contentState, selectionState, action, state} = context

    // Only when it's from a macro
    if (!action.fromMacro) {
        return context
    }

    const ticketState = action.ticket.toJS()
    const currentUser = _pick(action.currentUser.toJS(), [
        'name',
        'firstname',
        'lastname',
        'email',
    ])

    const variables = {
        ticket: ticketState,
        current_user: currentUser,
    }

    const text = renderTemplate(action.args.get('body_text', ''), variables)

    let html = renderTemplate(action.args.get('body_html', ''), variables)

    const sourceType = selectors.getNewMessageType({
        newMessage: state,
    } as StoreState)

    let blocks

    if (html && sourceType === TicketMessageSourceType.FacebookMessenger) {
        html = sanitizeHtmlForFacebookMessenger(html)
        blocks = convertFromHTML(html).getBlocksAsArray()
    } else if (html && isRichType(sourceType)) {
        blocks = convertFromHTML(html).getBlocksAsArray()
    } else {
        blocks = ContentState.createFromText(text).getBlocksAsArray()
    }

    if (contentState && contentState.hasText()) {
        const currBlocks = contentState.getBlocksAsArray()

        if (selectionState) {
            // Here we cut the current content at the cursor position to insert the macro.
            // Ex. : content is [1, 2, 3, 4, 5], we want to insert the macro ['a', 'b'] at index 2
            let idx = _findIndex(currBlocks, {
                key: (selectionState as SelectionState & {focusKey: string})
                    .focusKey,
            } as any)

            // if the focusOffset is bigger than 0 it means that the cursor is not at the beginning of the block
            // so we have to add our macro after the block
            if (
                (selectionState as SelectionState & {focusOffset: number})
                    .focusOffset > 0
            ) {
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
            context.selectionState = selectionAfter(
                blocks as any
            ) as SelectionState

            // => [1, 2, 'a', 'b', 3, 4, 5]
            blocks = blocks.concat(right)
        } else {
            blocks = currBlocks.concat(blocks)

            // selection should be at the end here because we had no selection before
            context.selectionState = selectionAfter(
                blocks as any
            ) as SelectionState
        }
    } else {
        // selection should be at the end here because no content means no selection
        context.selectionState = selectionAfter(blocks as any) as SelectionState
    }

    context.contentState = ContentState.createFromBlockArray(blocks)
    context.forceUpdate = true
    context.forceFocus = true

    return context
}
