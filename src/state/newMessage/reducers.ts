import {fromJS, Map, List} from 'immutable'
import {convertToRaw, ContentState, SelectionState} from 'draft-js'

import _pick from 'lodash/pick'
import _assign from 'lodash/assign'
import _omit from 'lodash/omit'
import _forOwn from 'lodash/forOwn'
import _get from 'lodash/get'

import {
    getSourceTypeOfResponse,
    getChannelFromSourceType,
} from '../ticket/utils.js'

import {
    TicketMessageSourceType,
    TicketChannel,
} from '../../business/types/ticket'
import * as ticketTypes from '../ticket/constants'
import * as ticketConfig from '../../config/ticket'
import {convertToHTML} from '../../utils/editor'
import {GorgiasAction} from '../types'

import {getReceiversProperties} from './selectors'
import * as responseUtils from './responseUtils'
import * as types from './constants'
import {NewMessageState} from './types'

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

export const initialState: NewMessageState = fromJS({
    state: {
        dirty: false,
        signatureAdded: false,
        cacheAdded: false,
        forceUpdate: false,
        forceFocus: false,
        contentState: ContentState.createFromText(''),
        selectionState: null,
        appliedMacro: null,
        firstNewMessage: true,
    },
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
                signatureAdded: false,
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
                    attachments: (state.getIn(
                        ['newMessage', 'attachments'],
                        fromJS([])
                    ) as List<any>).concat(fromJS(action.resp)),
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
                    (state.getIn(
                        ['newMessage', 'attachments'],
                        fromJS([])
                    ) as List<any>).delete(action.index as number)
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
                    (macro: Record<string, unknown>) => macro.id === macroId
                )
            ) {
                return state
            }

            return state.updateIn(
                ['newMessage', 'macros'],
                (macros: unknown[]) => macros.push({id: macroId})
            )
        }

        case ticketTypes.CLEAR_TICKET: {
            return initialState
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_START: {
            return state
                .setIn(['_internal', 'loading', 'submitMessage'], true)
                .setIn(['state', 'dirty'], false)
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START: {
            const messages = fromJS(action.messages) as List<any>
            // clear the reply cache
            responseUtils.deleteReplyCache(
                (action.ticketId as unknown) as string
            )

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

            //$TsFixMe remove casting once getSourceTypeOfResponse is migrated
            const sourceType = getSourceTypeOfResponse(
                messages
            ) as TicketMessageSourceType
            return resetContentState(state).set(
                'newMessage',
                makeNewMessage(
                    //$TsFixMe remove casting once getChannelFromSourceType is migrated
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
            const messages = ticket?.get('messages') || fromJS([])

            const messageType = state.getIn(['newMessage', 'source', 'type'])
            const sourceType = messageType || getSourceTypeOfResponse(messages)

            const newMessage = makeNewMessage(
                //$TsFixMe remove casting once getChannelFromSourceType is migrated
                getChannelFromSourceType(sourceType) as TicketChannel,
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
            const {channel} = action.resp as {channel: TicketChannel}
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
                //$TsFixMe remove casting once getSourceTypeOfResponse is migrated
                makeNewMessage(
                    channel,
                    getSourceTypeOfResponse(messages) as TicketMessageSourceType
                )
            )
        }

        case types.NEW_MESSAGE_FETCH_TICKET_SUCCESS: {
            const {messages} = action.resp as {messages: unknown[]}
            //$TsFixMe remove casting once getSourceTypeOfResponse is migrated
            const sourceType = getSourceTypeOfResponse(
                messages
            ) as TicketMessageSourceType

            return resetContentState(state).set(
                'newMessage',
                makeNewMessage(
                    //$TsFixMe remove casting once getChannelFromSourceType is migrated
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
            const channel = getChannelFromSourceType(sourceType, messages)

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
                fromJS(action.extra)
            )
        }

        case types.SET_RESPONSE_TEXT: {
            let contentState: ContentState =
                action.args?.get('contentState') ||
                state.getIn(['state', 'contentState'])
            let selectionState =
                action.args?.get('selectionState') ||
                state.getIn(['state', 'selectionState'])
            const {appliedMacro, forceFocus, forceUpdate} = action
            const source = state.getIn(
                ['newMessage', 'source'],
                fromJS({})
            ) as Map<any, any>

            // email-forward uses email source type
            const forward = source.getIn(['extra', 'forward'])
            const sourceType = forward ? 'email-forward' : source.get('type')

            let context: responseUtils.MessageContext = {
                action: action as any,
                state,
                contentState,
                selectionState,
                appliedMacro: appliedMacro as Map<any, any>,
                forceUpdate: forceUpdate as boolean,
                forceFocus: forceFocus as boolean,
                sourceType,
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
                    .mergeDeep({
                        newMessage: {
                            body_text: contentState
                                ? contentState.getPlainText()
                                : '',
                            body_html: contentState
                                ? convertToHTML(contentState)
                                : '',
                        },
                        state: {
                            dirty,
                            forceFocus: !!context.forceFocus,
                            forceUpdate: !!context.forceUpdate,
                            cacheAdded: !!context.cacheAdded,
                        },
                    })
                    // not in the mergeDeep because it would be merged with the previous contentState instead of replacing it
                    .setIn(['state', 'contentState'], contentState)
                    .setIn(['state', 'selectionState'], selectionState)
                    .setIn(['newMessage', 'mention_ids'], ids)
            )
        }

        case types.NEW_MESSAGE_ADD_SIGNATURE: {
            const {contentState, signature} = action
            const newContentState = responseUtils.addSignature(
                contentState as ContentState,
                signature as Map<any, any>
            ) as ContentState

            return state
                .mergeDeep({
                    newMessage: {
                        body_text: newContentState
                            ? newContentState.getPlainText()
                            : '',
                        body_html: newContentState
                            ? convertToHTML(newContentState)
                            : '',
                    },
                    state: {
                        forceUpdate: true,
                        signatureAdded: true,
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

            const currentSource = (state.getIn(
                ['newMessage', 'source'],
                fromJS({})
            ) as Map<any, any>).toJS()

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
            return resetContentState(state)
                .mergeDeep({
                    state: {
                        cacheAdded: true,
                        dirty: false,
                        forceUpdate: true,
                        forceFocus: true,
                    },
                    newMessage: fromJS(
                        (action.payload as {
                            newMessage: Record<string, unknown>
                        }).newMessage
                    ),
                })
                .setIn(
                    ['state', 'contentState'],
                    (action.payload as {contentState: Map<any, any>})
                        .contentState
                )
                .setIn(
                    ['state', 'selectionState'],
                    //@ts-ignore
                    SelectionState.createEmpty()
                )
        }

        default:
            return state
    }
}
