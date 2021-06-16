import {ContentState, convertFromRaw, SelectionState} from 'draft-js'
import {fromJS, Map} from 'immutable'
import _findIndex from 'lodash/findIndex'
import _pick from 'lodash/pick'
import _take from 'lodash/take'
import _takeRight from 'lodash/takeRight'

import {TicketMessageSourceType} from '../../business/types/ticket'
import {isRichType} from '../../config/ticket'
import {renderTemplate} from '../../pages/common/utils/template.js'
import {convertFromHTML, convertToHTML} from '../../utils/editor'
import {sanitizeHtmlForFacebookMessenger} from '../../utils/html'
import {CurrentUser, StoreState} from '../types'
import {convertToRawWithoutPredictions} from '../../pages/common/draftjs/plugins/prediction/utils'
import {toJS} from '../../utils'

import * as selectors from './selectors'
import ticketReplyCache from './ticketReplyCache'
import {
    deleteEmailExtraContent,
    hasEmailExtraContent,
    hasOnlySignatureText,
    Signature,
} from './emailExtraUtils'
import {NewMessage, ReplyAreaState} from './types'

export type MessageContext = {
    action: {
        fromMacro: boolean
        ticketId: string
        currentUser: CurrentUser
        ticket: Map<any, any>
        args: Map<any, any>
        signature: Signature
    }
    appliedMacro?: Map<any, any>
    contentState: ContentState
    forceUpdate: boolean
    forceFocus: boolean
    state: Map<any, any>
    emailExtraAdded?: boolean
    cacheAdded?: boolean
    selectionState?: SelectionState
    sourceType?: string
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
            context.emailExtraAdded = cachedContent.get(
                'emailExtraAdded',
                false
            )
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
        emailExtraAdded,
    } = context
    // We're storing the content state in a persistent storage so we can keep it after page refresh
    if (
        (contentState &&
            contentState.hasText() &&
            !hasOnlySignatureText(
                contentState,
                action.signature || fromJS({})
            )) ||
        appliedMacro
    ) {
        // TODO (@xarg): We also need to keep the attachments in the cache
        ticketReplyCache.set(action.ticketId, {
            selectionState,
            sourceType,
            emailExtraAdded,
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

export const toReplyAreaState = (
    replyAreaStateMap: Map<any, any>
): ReplyAreaState => {
    const replyAreaState = toJS<ReplyAreaState>(replyAreaStateMap)
    replyAreaState.contentState = replyAreaStateMap.get('contentState')
    replyAreaState.selectionState = replyAreaStateMap.get('selectionState')
    return replyAreaState
}

export const updateNewMessageWithContentState = (
    prevNewMessage: NewMessage,
    contentState: ContentState
): NewMessage => {
    const newMessage = {...prevNewMessage}
    delete newMessage.stripped_html
    delete newMessage.stripped_text
    newMessage.body_html = convertToHTML(contentState)
    newMessage.body_text = contentState.getPlainText()

    if (hasEmailExtraContent(contentState)) {
        const userInput = deleteEmailExtraContent(contentState)
        newMessage.stripped_text = userInput.getPlainText()
        newMessage.stripped_html = convertToHTML(userInput)
    }

    return newMessage
}
