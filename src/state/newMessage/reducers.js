// @flow
import {fromJS} from 'immutable'
import {convertToRaw, ContentState, SelectionState} from 'draft-js'

import _pick from 'lodash/pick'
import _assign from 'lodash/assign'
import _omit from 'lodash/omit'
import _forOwn from 'lodash/forOwn'
import _get from 'lodash/get'

import type {Map} from 'immutable'

import {
    getSourceTypeOfResponse,
    getChannelFromSourceType,
} from '../ticket/utils'

import type {TicketMessageSourceType} from '../../business/ticket'
import * as ticketTypes from '../ticket/constants'
import * as ticketConfig from '../../config/ticket'
import {convertToHTML} from '../../utils/editor'
import type {actionType} from '../types'

import {getReceiversProperties} from './selectors'
import * as responseUtils from './responseUtils'
import * as types from './constants'

export const makeNewMessage = (
    channel: string,
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
    })
}

export const initialState = fromJS({
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
    newMessage: makeNewMessage('email', 'email'),
})

const resetContentState = (state: Map<*, *>) => {
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
    state: Map<*, *> = initialState,
    action: actionType
): Map<*, *> {
    switch (action.type) {
        case types.NEW_MESSAGE_ADD_ATTACHMENT_START: {
            return state.setIn(['_internal', 'loading', 'addAttachment'], true)
        }

        case types.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS: {
            return state.mergeDeep({
                newMessage: {
                    attachments: state
                        .getIn(['newMessage', 'attachments'], fromJS([]))
                        .concat(fromJS(action.resp)),
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
                (attachements) => {
                    return attachements.concat(action.args.get('attachments'))
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
                    state
                        .getIn(['newMessage', 'attachments'], fromJS([]))
                        .delete(action.index)
                )
                .setIn(['state', 'dirty'], true)
        }

        case types.NEW_MESSAGE_RECORD_MACRO: {
            const macroId = action.macro.get('id')
            const macros = state.getIn(['newMessage', 'macros']) || fromJS([])

            // if macro already added, do not do anything
            if (macros.find((macro) => macro.id === macroId)) {
                return state
            }

            return state.updateIn(['newMessage', 'macros'], (macros) =>
                macros.push({id: macroId})
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
            let messages = fromJS(action.messages)
            // clear the reply cache
            responseUtils.deleteReplyCache(action.ticketId)

            let newState = resetContentState(state).mergeDeep({
                state: {
                    forceUpdate: false,
                    forceFocus: false,
                    firstNewMessage: false,
                },
            })

            if (!action.resetMessage) {
                return newState
            }

            const sourceType = getSourceTypeOfResponse(messages)
            return resetContentState(state).set(
                'newMessage',
                makeNewMessage(
                    getChannelFromSourceType(sourceType, messages),
                    sourceType
                )
            )
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_ERROR: {
            return state.setIn(['_internal', 'loading', 'submitMessage'], false)
        }

        case types.NEW_MESSAGE_RESET_FROM_TICKET: {
            const {ticket} = action
            const messages = ticket.get('messages', fromJS([]))

            const messageType = state.getIn(['newMessage', 'source', 'type'])
            const sourceType = messageType || getSourceTypeOfResponse(messages)

            const newMessage = makeNewMessage(
                getChannelFromSourceType(sourceType),
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
            const {channel} = action.resp
            let messages = fromJS(action.resp.messages)

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
                makeNewMessage(channel, getSourceTypeOfResponse(messages))
            )
        }

        case types.NEW_MESSAGE_FETCH_TICKET_SUCCESS: {
            const {messages} = action.resp
            const sourceType = getSourceTypeOfResponse(messages)

            return resetContentState(state).set(
                'newMessage',
                makeNewMessage(
                    getChannelFromSourceType(sourceType, messages),
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
                    ticketConfig.isPublic(sourceType)
                )
        }

        case types.NEW_MESSAGE_SET_SOURCE_EXTRA: {
            return state.setIn(
                ['newMessage', 'source', 'extra'],
                fromJS(action.extra)
            )
        }

        case types.SET_RESPONSE_TEXT: {
            let contentState =
                action.args.get('contentState') ||
                state.getIn(['state', 'contentState'])
            let selectionState =
                action.args.get('selectionState') ||
                state.getIn(['state', 'selectionState'])
            const {appliedMacro, forceFocus, forceUpdate} = action
            const source = state.getIn(['newMessage', 'source'], fromJS({}))

            // email-forward uses email source type
            const forward = source.getIn(['extra', 'forward'])
            const sourceType = forward ? 'email-forward' : source.get('type')

            let context = {
                action,
                state,
                contentState,
                selectionState,
                appliedMacro,
                forceUpdate,
                forceFocus,
                sourceType,
            }

            context = responseUtils.addCache(context)
            context = responseUtils.applyMacro(context)
            responseUtils.updateCache(context)

            contentState = context.contentState
            selectionState = context.selectionState

            // get ids of all mentions within any entities in contentState, only if in internal note
            let ids = fromJS([])
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
                contentState,
                signature
            )

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

            const currentSource = state
                .getIn(['newMessage', 'source'], fromJS({}))
                .toJS()

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
                    newMessage: fromJS(action.payload.newMessage),
                })
                .setIn(['state', 'contentState'], action.payload.contentState)
                .setIn(
                    ['state', 'selectionState'],
                    SelectionState.createEmpty()
                )
        }

        default:
            return state
    }
}
