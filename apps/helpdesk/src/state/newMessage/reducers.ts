import { ContentState } from 'draft-js'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _assign from 'lodash/assign'
import _omit from 'lodash/omit'
import _pick from 'lodash/pick'

import type { TicketVia } from 'business/types/ticket'
import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import type { DiscountCode } from 'models/discountCodes/types'
import type { MacroAction } from 'models/macroAction/types'
import type { AttachmentPosition } from 'pages/convert/campaigns/types/CampaignAttachment'
import * as ticketTypes from 'state/ticket/constants'
import { getSourceTypeOfResponse } from 'state/ticket/utils'
import type { GorgiasAction } from 'state/types'
import { getChannelFromSourceType, isPublic } from 'tickets/common/utils'

import type { addEmailExtra } from './actions'
import * as types from './constants'
import {
    addEmailExtraContent,
    deleteEmailExtraContent,
    hasEmailExtraContent,
    updateEmailExtraOnUserInput,
} from './emailExtraUtils'
import type { MessageContext } from './responseUtils'
import {
    addCache,
    applyMacro,
    deleteReplyCache,
    updateCache,
    updateNewMessageWithContentState,
} from './responseUtils'
import { getReceiversProperties } from './selectors'
import ticketReplyCache from './ticketReplyCache'
import type { NewMessage, NewMessageState, ReplyAreaState } from './types'
import { getMentionIds } from './utils'

const defaultSourceExtra = {
    include_thread: false,
}

export const makeNewMessage = (
    channel: TicketChannel,
    sourceType: TicketMessageSourceType,
) => {
    return fromJS({
        via: 'helpdesk',
        public: isPublic(sourceType),
        from_agent: true,
        sender: null,
        source: {
            type: sourceType,
            from: {}, // = ticket.messages[first].from_agent ? ticket.messages[first].source.from : ... .to
            to: [],
            cc: [],
            bcc: [],
            extra: { ...defaultSourceExtra },
        },
        subject: '',
        body_text: '',
        body_html: '',
        channel,
        attachments: [],
        macros: [],
        mention_ids: [],
    }) as Map<any, any>
}

const initialReplyAreaState: ReplyAreaState = {
    dirty: false,
    emailExtraAdded: false,
    cacheAdded: false,
    forceUpdate: false,
    forceFocus: false,
    contentState: ContentState.createFromText(''),
    selectionState: null,
    appliedMacro: null,
    firstNewMessage: true,
    inserted_discounts: [],
}

export const initialState: NewMessageState = fromJS({
    state: initialReplyAreaState,
    _internal: {
        loading: {
            addAttachment: false,
            submitMessage: false,
        },
    },
    newMessage: makeNewMessage(
        TicketChannel.Email,
        TicketMessageSourceType.Email,
    ),
})

const resetContentState = (state: Map<any, any>): NewMessageState => {
    return state
        .mergeDeep({
            state: {
                dirty: false,
                cacheAdded: false,
                emailExtraAdded: false,
            },
        })
        .setIn(['state', 'contentState'], ContentState.createFromText(''))
        .setIn(['state', 'selectionState'], null)
        .setIn(['state', 'inserted_discounts'], fromJS([]))
        .deleteIn(['state', 'originalContentState'])
}

export default function reducer(
    state: NewMessageState = initialState,
    action: GorgiasAction,
): NewMessageState {
    switch (action.type) {
        case types.NEW_MESSAGE_ADD_ATTACHMENT_START: {
            return state.setIn(['_internal', 'loading', 'addAttachment'], true)
        }

        case types.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS: {
            return state.mergeDeep({
                newMessage: {
                    attachments: (
                        state.getIn(
                            ['newMessage', 'attachments'],
                            fromJS([]),
                        ) as List<any>
                    ).concat(fromJS(action.resp)),
                },
                state: {
                    dirty: true,
                },
                _internal: {
                    loading: {
                        addAttachment: false,
                    },
                },
            })
        }

        case types.NEW_MESSAGE_ADD_SORTED_ATTACHMENT_SUCCESS: {
            return state.mergeDeep({
                newMessage: {
                    attachments: (
                        state.getIn(
                            ['newMessage', 'attachments'],
                            fromJS([]),
                        ) as List<any>
                    )
                        .concat(fromJS(action.resp))
                        // Sort attachments by content type
                        .sort((a: Map<any, any>, b: Map<any, any>) =>
                            String(a.get('content_type')).localeCompare(
                                String(b.get('content_type')),
                            ),
                        ),
                },
                state: {
                    dirty: true,
                },
                _internal: {
                    loading: {
                        addAttachment: false,
                    },
                },
            })
        }

        case types.ADD_ATTACHMENTS: {
            return state.updateIn(
                ['newMessage', 'attachments'],
                fromJS([]),
                (attachments: List<any>) => {
                    return attachments.concat(action.args?.get('attachments'))
                },
            )
        }

        case types.NEW_MESSAGE_ADD_ATTACHMENT_ERROR: {
            return state.setIn(['_internal', 'loading', 'addAttachment'], false)
        }

        case types.NEW_MESSAGE_DELETE_ATTACHMENT: {
            return state
                .setIn(
                    ['newMessage', 'attachments'],
                    (
                        state.getIn(
                            ['newMessage', 'attachments'],
                            fromJS([]),
                        ) as List<any>
                    ).delete(action.index as number),
                )
                .setIn(['state', 'dirty'], true)
        }

        case types.UPDATE_CAMPAIGN_PRODUCT_POSITION: {
            const { productId, position } = action.payload as {
                productId: number
                position: AttachmentPosition
            }
            const attachments: List<Map<any, any>> = state.getIn([
                'newMessage',
                'attachments',
            ])
            const currentAttachmentIndex = attachments.findIndex((item) => {
                if (item) {
                    return item.getIn(['extra', 'product_id']) === productId
                }
                return false
            })

            return state.setIn(
                ['newMessage', 'attachments'],
                attachments.setIn(
                    [currentAttachmentIndex, 'extra', 'position'],
                    position,
                ),
            )
        }

        case types.NEW_MESSAGE_RECORD_MACRO: {
            const macroId = action.macro?.get('id') as number
            const macros = (state.getIn(['newMessage', 'macros']) ||
                fromJS([])) as List<any>

            // if macro already added, do not do anything
            if (
                macros.find(
                    (macro: Map<any, any>) => macro.get('id') === macroId,
                )
            ) {
                return state
            }

            return state.updateIn(
                ['newMessage', 'macros'],
                (macros: unknown[]) => macros.push(fromJS({ id: macroId })),
            )
        }

        case ticketTypes.CLEAR_TICKET: {
            return initialState
        }

        case types.NEW_MESSAGE_RESET_CONTENT_STATE: {
            ticketReplyCache.set(action.ticketId as string, {
                contentState: null,
                selectionState: null,
            })
            return state
                .setIn(
                    ['state', 'contentState'],
                    ContentState.createFromText(''),
                )
                .setIn(['state', 'selectionState'], null)
        }

        case types.NEW_MESSAGE_SHOW_CONVERT_TO_FORWARD_POPOVER: {
            return state.setIn(
                ['state', 'showConvertToForwardPopover'],
                action.payload,
            )
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_START: {
            return state
                .setIn(['_internal', 'loading', 'submitMessage'], true)
                .setIn(['state', 'dirty'], false)
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START: {
            const messages = fromJS(action.messages) as List<any>
            const via = action.ticketVia
            // clear the reply cache
            deleteReplyCache(action.ticketId as unknown as string)

            const newState = resetContentState(state).mergeDeep({
                state: {
                    forceUpdate: false,
                    forceFocus: false,
                    firstNewMessage: false,
                },
            })

            if (!action.resetMessage) {
                return newState
            }

            const sourceType = getSourceTypeOfResponse(
                messages,
                via!,
                action.ticketId as string,
            )
            return resetContentState(state).set(
                'newMessage',
                makeNewMessage(
                    getChannelFromSourceType(
                        sourceType,
                        messages,
                    ) as TicketChannel,
                    sourceType,
                ),
            )
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_ERROR: {
            return state.setIn(['_internal', 'loading', 'submitMessage'], false)
        }

        case types.NEW_MESSAGE_RESET_FROM_TICKET: {
            const { ticket } = action
            const via = ticket?.get('via')
            const messages = ticket?.get('messages') || fromJS([])

            const messageType = state.getIn(['newMessage', 'source', 'type'])
            const sourceType =
                messageType ||
                getSourceTypeOfResponse(messages, via, ticket?.get('id'))

            const newMessage = makeNewMessage(
                getChannelFromSourceType(
                    sourceType,
                    fromJS([]),
                ) as TicketChannel,
                sourceType,
            )
                .set('subject', state.getIn(['newMessage', 'subject']))
                .set('body_text', state.getIn(['newMessage', 'body_text']))
                .set('body_html', state.getIn(['newMessage', 'body_html']))
                .set('attachments', state.getIn(['newMessage', 'attachments']))
                .set('macros', state.getIn(['newMessage', 'macros']))

            return state.set('newMessage', newMessage)
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS: {
            const { channel, via, id } = action.resp as {
                channel: TicketChannel
                via: TicketVia
                id: string
            }
            const messages = fromJS(
                (action.resp as { messages: unknown[] }).messages,
            )

            const newState = resetContentState(state)
                .mergeDeep({
                    state: {
                        appliedMacro: null,
                        forceUpdate: false,
                        forceFocus: false,
                    },
                })
                .setIn(['_internal', 'loading', 'submitMessage'], false)

            if (!action.resetMessage) {
                return newState
            }

            return newState.set(
                'newMessage',
                makeNewMessage(
                    channel,
                    getSourceTypeOfResponse(messages, via, id),
                ),
            )
        }

        case types.NEW_MESSAGE_FETCH_TICKET_SUCCESS: {
            const { messages, via, id, meta } = action.resp as {
                messages: unknown[]
                meta: Record<string, unknown>
                via: TicketVia
                id: string
            }
            const sourceType =
                (meta?.response_channel as TicketMessageSourceType) ??
                getSourceTypeOfResponse(messages, via, id)

            return resetContentState(state).set(
                'newMessage',
                makeNewMessage(
                    getChannelFromSourceType(
                        sourceType,
                        messages,
                    ) as TicketChannel,
                    sourceType,
                ),
            )
        }

        case types.NEW_MESSAGE_SET_SOURCE_TYPE: {
            const { messages, sourceType } = action
            const channel = getChannelFromSourceType(sourceType!, messages!)

            let newState = state
                .setIn(['newMessage', 'channel'], channel)
                .setIn(['newMessage', 'source', 'type'], sourceType)
                .setIn(
                    ['newMessage', 'public'],
                    isPublic(sourceType as TicketMessageSourceType),
                )

            if (sourceType === TicketMessageSourceType.InternalNote) {
                const originalContent = newState.getIn([
                    'state',
                    'originalContentState',
                ]) as ContentState

                if (originalContent) {
                    newState = newState
                        .setIn(['state', 'contentState'], originalContent)
                        .deleteIn(['state', 'originalContentState'])
                        .update('newMessage', (newMessage: Map<any, any>) => {
                            return fromJS(
                                updateNewMessageWithContentState(
                                    newMessage.toJS() as NewMessage,
                                    originalContent,
                                ),
                            ) as Map<any, any>
                        })
                        // Force the editor to update with the original content
                        .setIn(['state', 'forceUpdate'], true)
                }
            }

            return newState
        }

        case types.NEW_MESSAGE_SET_SOURCE_EXTRA: {
            return state.setIn(
                ['newMessage', 'source', 'extra'],
                fromJS({
                    ...defaultSourceExtra,
                    ...action.extra,
                }),
            )
        }

        case types.SET_RESPONSE_TEXT: {
            const prevContentState = state.getIn([
                'state',
                'contentState',
            ]) as ContentState
            let contentState: ContentState =
                action.args?.get('contentState') ||
                state.getIn(['state', 'contentState'])
            let selectionState =
                action.args?.get('selectionState') ||
                state.getIn(['state', 'selectionState'])
            const { appliedMacro, forceFocus, topRankMacroState } = action
            let { forceUpdate } = action
            const source = state.getIn(
                ['newMessage', 'source'],
                fromJS({}),
            ) as Map<any, any>
            const emailExtraAdded = action.args?.has('emailExtraAdded')
                ? action.args?.get('emailExtraAdded')
                : state.getIn(['state', 'emailExtraAdded'])

            // email-forward uses email source type
            const forward = source.getIn(['extra', 'forward'])
            const sourceType = forward ? 'email-forward' : source.get('type')

            const emailExtraUpdatedContentState = updateEmailExtraOnUserInput(
                prevContentState,
                contentState,
            )
            if (!emailExtraUpdatedContentState.equals(contentState)) {
                contentState = emailExtraUpdatedContentState
                forceUpdate = true
            }

            let context: MessageContext = {
                state,
                contentState,
                selectionState,
                sourceType,
                emailExtraAdded,
                action: action as any,
                appliedMacro: appliedMacro as Map<any, any>,
                forceUpdate: forceUpdate as boolean,
                forceFocus: forceFocus as boolean,
                topRankMacroState,
                originalContentState: state.getIn([
                    'state',
                    'originalContentState',
                ]) as ContentState,
            }

            context = addCache(context)
            context = applyMacro(context as any)
            updateCache(context as any)

            contentState = context.contentState
            selectionState = context.selectionState

            const ids = getMentionIds(
                contentState,
                state.getIn(['newMessage', 'source', 'type']),
            )

            let dirty = state.getIn(['state', 'dirty'])
            if (!dirty && contentState.hasText()) {
                dirty = true
            }

            // only update discounts if there's a valid value
            let insertedDiscounts = state.getIn(['state', 'inserted_discounts'])
            if (context.inserted_discounts) {
                insertedDiscounts = context.inserted_discounts
            }

            let newState = context.state
                .update('newMessage', (newMessage: Map<any, any>) => {
                    return fromJS(
                        updateNewMessageWithContentState(
                            newMessage.toJS() as NewMessage,
                            contentState,
                        ),
                    ) as Map<any, any>
                })
                .mergeDeep({
                    state: {
                        dirty,
                        forceFocus: !!context.forceFocus,
                        forceUpdate: !!context.forceUpdate,
                        cacheAdded: !!context.cacheAdded,
                        emailExtraAdded: !!context.emailExtraAdded,
                        inserted_discounts: insertedDiscounts,
                    },
                })
                // not in the mergeDeep because it would be merged with the previous contentState instead of replacing it
                .setIn(['state', 'contentState'], contentState)
                .setIn(['state', 'selectionState'], selectionState)
                .setIn(['newMessage', 'mention_ids'], ids)

            // Restore originalContentState from cache if it exists
            if (context.originalContentState) {
                newState = newState.setIn(
                    ['state', 'originalContentState'],
                    context.originalContentState,
                )
            }

            return newState
        }

        case types.NEW_MESSAGE_ADD_EMAIL_EXTRA: {
            const { contentState, emailExtraArgs } = (
                action as ReturnType<typeof addEmailExtra>
            ).payload
            if (state.getIn(['state', 'emailExtraAdded'], false)) {
                return state
            }
            const newContentState = addEmailExtraContent(
                contentState,
                emailExtraArgs,
            )
            return state
                .update('newMessage', (newMessage: Map<any, any>) => {
                    return fromJS(
                        updateNewMessageWithContentState(
                            newMessage.toJS() as NewMessage,
                            newContentState,
                        ),
                    ) as Map<any, any>
                })
                .mergeDeep({
                    state: {
                        forceUpdate: true,
                        emailExtraAdded: true,
                    },
                })
                .setIn(['state', 'contentState'], newContentState)
        }

        case types.NEW_MESSAGE_SET_SENDER: {
            return state.setIn(['newMessage', 'source', 'from'], action.sender)
        }

        case types.NEW_MESSAGE_SET_SUBJECT: {
            return state.setIn(['newMessage', 'subject'], action.subject)
        }

        case types.NEW_MESSAGE_SET_META: {
            return state.setIn(['newMessage', 'meta'], action.meta)
        }

        case types.NEW_MESSAGE_SET_RECEIVERS: {
            const receivers = _pick(action.receivers, getReceiversProperties())
            const replaceAll = action.replaceAll

            const currentSource = (
                state.getIn(['newMessage', 'source'], fromJS({})) as Map<
                    any,
                    any
                >
            ).toJS()

            let newReceivers = {}

            if (replaceAll) {
                // we replace all receivers in source by passed ones
                newReceivers = receivers
            } else {
                // we merge existing receivers with passed ones
                const currentReceivers = _pick(
                    currentSource,
                    getReceiversProperties(),
                )
                newReceivers = _assign(currentReceivers, receivers)
            }

            // removing current receivers from source
            const sourceWithoutReceivers = _omit(
                currentSource,
                getReceiversProperties(),
            )

            // setting new receivers in source
            return state.setIn(
                ['newMessage', 'source'],
                fromJS(_assign(sourceWithoutReceivers, newReceivers)),
            )
        }

        case types.NEW_MESSAGE_RESET_FROM_MESSAGE: {
            const payload = action.payload as {
                newMessage: NewMessage
                replyAreaState: ReplyAreaState
            }
            let {
                newMessage,
                replyAreaState: { contentState, emailExtraAdded },
            } = payload

            // Remove email extra on reset because we always add it on submit
            if (hasEmailExtraContent(contentState)) {
                contentState = deleteEmailExtraContent(contentState)
                newMessage = updateNewMessageWithContentState(
                    newMessage,
                    contentState,
                )
                emailExtraAdded = false
            }

            return resetContentState(state)
                .mergeDeep({
                    newMessage: fromJS(newMessage),
                    state: {
                        emailExtraAdded,
                        cacheAdded: true,
                        dirty: false,
                        forceUpdate: true,
                        forceFocus: true,
                    },
                })
                .setIn(['state', 'contentState'], contentState)
                .setIn(
                    ['state', 'selectionState'],
                    payload.replyAreaState.selectionState,
                )
        }

        case types.SET_NEW_MESSAGE_CHAT_CAMPAIGN: {
            const payload = action.payload as {
                attachments?: List<any>
                channel?: TicketChannel
                sourceType?: TicketMessageSourceType
            }

            const {
                attachments = fromJS([]),
                channel = TicketChannel.Email,
                sourceType = TicketMessageSourceType.Email,
            } = payload

            return state
                .setIn(['newMessage', 'attachments'], attachments)
                .setIn(['newMessage', 'channel'], channel)
                .setIn(['newMessage', 'source', 'type'], sourceType)
        }

        case types.SET_NEW_MESSAGE_DISCOUNT_CODE: {
            const discountCode = (action.discountCode as DiscountCode) || []
            const currentDiscountCodes =
                (state.getIn(['state', 'inserted_discounts']) as List<any>) ||
                fromJS([])

            if (
                currentDiscountCodes.find(
                    (discount: Map<any, any>) =>
                        discount.get('id') === discountCode.id,
                )
            ) {
                return state
            }

            const newState = state.setIn(
                ['state', 'inserted_discounts'],
                currentDiscountCodes.push(fromJS(discountCode)),
            )

            // persist discount codes in cache in case agent leaves the ticket
            ticketReplyCache.set(action.ticketId as string, {
                inserted_discounts: newState.getIn([
                    'state',
                    'inserted_discounts',
                ]),
            })

            return newState
        }

        case types.RESTORE_NEW_MESSAGE_DRAFT: {
            const { attachments, source } = action.payload as Pick<
                NewMessage,
                'attachments' | 'source'
            >
            return state
                .setIn(['newMessage', 'attachments'], fromJS(attachments))
                .setIn(['newMessage', 'source'], fromJS(source))
        }

        case types.RESTORE_NEW_MESSAGE_BODY_TEXT: {
            const context = action.payload as MessageContext
            const {
                contentState,
                emailExtraAdded,
                inserted_discounts,
                selectionState,
                forceFocus,
                forceUpdate,
                originalContentState,
            } = context

            const ids = getMentionIds(
                contentState,
                state.getIn(['newMessage', 'source', 'type']),
            )

            let dirty = state.getIn(['state', 'dirty'])
            if (!dirty && contentState.hasText()) {
                dirty = true
            }

            let newState = state
                .update(
                    'newMessage',
                    (newMessage: Map<any, any>) =>
                        fromJS(
                            updateNewMessageWithContentState(
                                newMessage.toJS() as NewMessage,
                                contentState,
                            ),
                        ) as Map<any, any>,
                )
                .mergeDeep({
                    state: {
                        dirty,
                        emailExtraAdded,
                        inserted_discounts,
                        forceFocus,
                        forceUpdate,
                    },
                })
                // not in the mergeDeep because it would be merged with the previous contentState instead of replacing it
                .setIn(['state', 'contentState'], contentState)
                .setIn(['state', 'selectionState'], selectionState)
                .setIn(['newMessage', 'mention_ids'], ids)

            if (originalContentState) {
                newState = newState.setIn(
                    ['state', 'originalContentState'],
                    originalContentState,
                )
            }

            return newState
        }

        case types.SET_NEW_MESSAGE_ACTIONS: {
            const newActions = fromJS(action.payload as MacroAction[])
            return state.setIn(['newMessage', 'actions'], newActions)
        }

        case types.SET_TRANSLATION_STATE: {
            const { translatedContentState } = action.payload as {
                translatedContentState: ContentState
            }

            const currentState = state.getIn([
                'state',
                'contentState',
            ]) as ContentState

            return state
                .setIn(['state', 'originalContentState'], currentState)
                .setIn(['state', 'contentState'], translatedContentState)
                .update('newMessage', (newMessage: Map<any, any>) => {
                    return fromJS(
                        updateNewMessageWithContentState(
                            newMessage.toJS() as NewMessage,
                            translatedContentState,
                        ),
                    ) as Map<any, any>
                })
        }

        case types.CLEAR_TRANSLATION_STATE: {
            const originalContent = state.getIn([
                'state',
                'originalContentState',
            ]) as ContentState

            if (originalContent) {
                return state
                    .setIn(['state', 'contentState'], originalContent)
                    .deleteIn(['state', 'originalContentState'])
                    .setIn(['state', 'forceUpdate'], true)
                    .update('newMessage', (newMessage: Map<any, any>) => {
                        return fromJS(
                            updateNewMessageWithContentState(
                                newMessage.toJS() as NewMessage,
                                originalContent,
                            ),
                        ) as Map<any, any>
                    })
            }

            return state
        }

        default:
            return state
    }
}
