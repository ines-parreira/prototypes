import {fromJS, Map, List} from 'immutable'
import {convertToRaw, ContentState} from 'draft-js'

import _pick from 'lodash/pick'
import _assign from 'lodash/assign'
import _omit from 'lodash/omit'
import _forOwn from 'lodash/forOwn'
import _get from 'lodash/get'

import {
    getSourceTypeOfResponse,
    getChannelFromSourceType,
} from '../ticket/utils'

import {
    TicketMessageSourceType,
    TicketChannel,
    TicketVia,
} from '../../business/types/ticket'
import * as ticketTypes from '../ticket/constants'
import * as ticketConfig from '../../config/ticket'
import {GorgiasAction} from '../types'

import {getReceiversProperties} from './selectors'
import * as responseUtils from './responseUtils'
import * as types from './constants'
import {NewMessage, NewMessageState, ReplyAreaState} from './types'
import {addEmailExtra} from './actions'
import {
    addEmailExtraContent,
    deleteEmailExtraContent,
    hasEmailExtraContent,
    updateEmailExtraOnUserInput,
} from './emailExtraUtils'

const defaultSourceExtra = {
    include_thread: false,
}

export const makeNewMessage = (
    channel: TicketChannel,
    sourceType: TicketMessageSourceType
) => {
    return fromJS({
        via: 'helpdesk',
        public: ticketConfig.isPublic(sourceType),
        from_agent: true,
        sender: null,
        source: {
            type: sourceType,
            from: {}, // = ticket.messages[first].from_agent ? ticket.messages[first].source.from : ... .to
            to: [],
            cc: [],
            bcc: [],
            extra: defaultSourceExtra,
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
        TicketMessageSourceType.Email
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
}

export default function reducer(
    state: NewMessageState = initialState,
    action: GorgiasAction
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
                            fromJS([])
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

        case types.ADD_ATTACHMENTS: {
            return state.updateIn(
                ['newMessage', 'attachments'],
                fromJS([]),
                (attachements: List<any>) => {
                    return attachements.concat(action.args?.get('attachments'))
                }
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
                            fromJS([])
                        ) as List<any>
                    ).delete(action.index as number)
                )
                .setIn(['state', 'dirty'], true)
        }

        case types.NEW_MESSAGE_RECORD_MACRO: {
            const macroId = action.macro?.get('id') as number
            const macros = (state.getIn(['newMessage', 'macros']) ||
                fromJS([])) as List<any>

            // if macro already added, do not do anything
            if (
                macros.find(
                    (macro: Map<any, any>) => macro.get('id') === macroId
                )
            ) {
                return state
            }

            return state.updateIn(
                ['newMessage', 'macros'],
                (macros: unknown[]) => macros.push(fromJS({id: macroId}))
            )
        }

        case ticketTypes.CLEAR_TICKET: {
            return initialState
        }

        case types.NEW_MESSAGE_QUICK_RESPONSE_FLOW: {
            return state
                .setIn(['newMessage', 'channel'], TicketChannel.Chat)
                .setIn(
                    ['newMessage', 'attachments'],
                    fromJS(action.attachments ?? []) as List<any>
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
            responseUtils.deleteReplyCache(action.ticketId as unknown as string)

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

            const sourceType = getSourceTypeOfResponse(messages, via!)
            return resetContentState(state).set(
                'newMessage',
                makeNewMessage(
                    getChannelFromSourceType(
                        sourceType,
                        messages
                    ) as TicketChannel,
                    sourceType
                )
            )
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_ERROR: {
            return state.setIn(['_internal', 'loading', 'submitMessage'], false)
        }

        case types.NEW_MESSAGE_RESET_FROM_TICKET: {
            const {ticket} = action
            const via = ticket?.get('via')
            const messages = ticket?.get('messages') || fromJS([])

            const messageType = state.getIn(['newMessage', 'source', 'type'])
            const sourceType =
                messageType || getSourceTypeOfResponse(messages, via)

            const newMessage = makeNewMessage(
                getChannelFromSourceType(
                    sourceType,
                    fromJS([])
                ) as TicketChannel,
                sourceType
            )
                .set('subject', state.getIn(['newMessage', 'subject']))
                .set('body_text', state.getIn(['newMessage', 'body_text']))
                .set('body_html', state.getIn(['newMessage', 'body_html']))
                .set('attachments', state.getIn(['newMessage', 'attachments']))
                .set('macros', state.getIn(['newMessage', 'macros']))

            return state.set('newMessage', newMessage)
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS: {
            const {channel, via} = action.resp as {
                channel: TicketChannel
                via: TicketVia
            }
            const messages = fromJS(
                (action.resp as {messages: unknown[]}).messages
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
                makeNewMessage(channel, getSourceTypeOfResponse(messages, via))
            )
        }

        case types.NEW_MESSAGE_FETCH_TICKET_SUCCESS: {
            const {messages, via} = action.resp as {
                messages: unknown[]
                via: TicketVia
            }
            const sourceType = getSourceTypeOfResponse(messages, via)

            return resetContentState(state).set(
                'newMessage',
                makeNewMessage(
                    getChannelFromSourceType(
                        sourceType,
                        messages
                    ) as TicketChannel,
                    sourceType
                )
            )
        }

        case types.NEW_MESSAGE_SET_SOURCE_TYPE: {
            const {messages, sourceType} = action
            const channel = getChannelFromSourceType(sourceType!, messages!)

            return state
                .setIn(['newMessage', 'channel'], channel)
                .setIn(['newMessage', 'source', 'type'], sourceType)
                .setIn(
                    ['newMessage', 'public'],
                    ticketConfig.isPublic(sourceType as TicketMessageSourceType)
                )
        }

        case types.NEW_MESSAGE_SET_SOURCE_EXTRA: {
            return state.setIn(
                ['newMessage', 'source', 'extra'],
                fromJS({
                    ...defaultSourceExtra,
                    ...action.extra,
                })
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
            const {appliedMacro, forceFocus} = action
            let {forceUpdate} = action
            const source = state.getIn(
                ['newMessage', 'source'],
                fromJS({})
            ) as Map<any, any>
            const emailExtraAdded = action.args?.has('emailExtraAdded')
                ? action.args?.get('emailExtraAdded')
                : state.getIn(['state', 'emailExtraAdded'])

            // email-forward uses email source type
            const forward = source.getIn(['extra', 'forward'])
            const sourceType = forward ? 'email-forward' : source.get('type')

            const emailExtraUpdatedContentState = updateEmailExtraOnUserInput(
                prevContentState,
                contentState
            )
            if (!emailExtraUpdatedContentState.equals(contentState)) {
                contentState = emailExtraUpdatedContentState
                forceUpdate = true
            }

            let context: responseUtils.MessageContext = {
                state,
                contentState,
                selectionState,
                sourceType,
                emailExtraAdded,
                action: action as any,
                appliedMacro: appliedMacro as Map<any, any>,
                forceUpdate: forceUpdate as boolean,
                forceFocus: forceFocus as boolean,
            }

            context = responseUtils.addCache(context)
            context = responseUtils.applyMacro(context as any)
            responseUtils.updateCache(context as any)

            contentState = context.contentState
            selectionState = context.selectionState

            // get ids of all mentions within any entities in contentState, only if in internal note
            let ids: List<any> = fromJS([])
            const isInternalNote = ticketConfig.canLeaveInternalNote(
                state.getIn(['newMessage', 'source', 'type'])
            )

            if (contentState && isInternalNote) {
                const entityMap = convertToRaw(contentState).entityMap
                _forOwn(entityMap, (entity) => {
                    if (entity.type === 'mention') {
                        // don't push duplicate ids
                        const id = _get(entity.data.mention, 'id')
                        if (!ids.includes(id)) {
                            ids = ids.push(id)
                        }
                    }
                })
            }

            let dirty = state.getIn(['state', 'dirty'])
            if (!dirty && contentState.hasText()) {
                dirty = true
            }

            return (
                context.state
                    .update('newMessage', (newMessage: Map<any, any>) => {
                        return fromJS(
                            responseUtils.updateNewMessageWithContentState(
                                newMessage.toJS() as NewMessage,
                                contentState
                            )
                        ) as Map<any, any>
                    })
                    .mergeDeep({
                        state: {
                            dirty,
                            forceFocus: !!context.forceFocus,
                            forceUpdate: !!context.forceUpdate,
                            cacheAdded: !!context.cacheAdded,
                            emailExtraAdded: !!context.emailExtraAdded,
                        },
                    })
                    // not in the mergeDeep because it would be merged with the previous contentState instead of replacing it
                    .setIn(['state', 'contentState'], contentState)
                    .setIn(['state', 'selectionState'], selectionState)
                    .setIn(['newMessage', 'mention_ids'], ids)
            )
        }

        case types.NEW_MESSAGE_ADD_EMAIL_EXTRA: {
            const {contentState, emailExtraArgs} = (
                action as ReturnType<typeof addEmailExtra>
            ).payload
            if (state.getIn(['state', 'emailExtraAdded'], false)) {
                return state
            }
            const newContentState = addEmailExtraContent(
                contentState,
                emailExtraArgs
            )
            return state
                .update('newMessage', (newMessage: Map<any, any>) => {
                    return fromJS(
                        responseUtils.updateNewMessageWithContentState(
                            newMessage.toJS() as NewMessage,
                            newContentState
                        )
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
                    getReceiversProperties()
                )
                newReceivers = _assign(currentReceivers, receivers)
            }

            // removing current receivers from source
            const sourceWithoutReceivers = _omit(
                currentSource,
                getReceiversProperties()
            )

            // setting new receivers in source
            return state.setIn(
                ['newMessage', 'source'],
                fromJS(_assign(sourceWithoutReceivers, newReceivers))
            )
        }

        case types.NEW_MESSAGE_RESET_FROM_MESSAGE: {
            const payload = action.payload as {
                newMessage: NewMessage
                replyAreaState: ReplyAreaState
            }
            let {
                newMessage,
                replyAreaState: {contentState, emailExtraAdded},
            } = payload

            // Remove email extra on reset because we always add it on submit
            if (hasEmailExtraContent(contentState)) {
                contentState = deleteEmailExtraContent(contentState)
                newMessage = responseUtils.updateNewMessageWithContentState(
                    newMessage,
                    contentState
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
                    payload.replyAreaState.selectionState
                )
        }

        default:
            return state
    }
}
