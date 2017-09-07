import * as types from './constants'
import {fromJS} from 'immutable'
import {convertToRaw} from 'draft-js'
import {convertToHTML} from '../../utils'
import * as responseUtils from './responseUtils'
import {
    getReceiversProperties,
} from './selectors'

import * as ticketConfig from '../../config/ticket'

import * as ticketTypes from '../ticket/constants'

import _pick from 'lodash/pick'
import _assign from 'lodash/assign'
import _omit from 'lodash/omit'
import _forOwn from 'lodash/forOwn'

import {
    getSourceTypeOfResponse,
    getChannelFromSourceType,
} from '../ticket/utils'

export const makeNewMessage = (channel, sourceType) => fromJS({
    via: 'helpdesk',
    public: true,
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

export const initialState = fromJS({
    state: {
        dirty: false,
        signatureAdded: false,
        cacheAdded: false,
        forceUpdate: false,
        forceFocus: false,
        contentState: null,
        selectionState: null,
        appliedMacro: null,
    },
    _internal: {
        loading: {
            addAttachment: false,
            submitMessage: false,
        },
    },
    newMessage: makeNewMessage('email', 'email')
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.NEW_MESSAGE_ADD_ATTACHMENT_START: {
            return state.setIn(['_internal', 'loading', 'addAttachment'], true)
        }

        case types.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS: {
            return state.mergeDeep({
                newMessage: {
                    attachments: state.getIn(['newMessage', 'attachments'], fromJS([])).concat(action.resp),
                },
                state: {
                    dirty: true,
                },
                _internal: {
                    loading: {
                        addAttachment: false,
                    }
                }
            })
        }

        case types.ADD_ATTACHMENTS: {
            return state.updateIn(['newMessage', 'attachments'], fromJS([]), (attachements) => {
                return attachements.concat(action.args.get('attachments').toJS())
            })
        }

        case types.NEW_MESSAGE_ADD_ATTACHMENT_ERROR: {
            return state.setIn(['_internal', 'loading', 'addAttachment'], false)
        }

        case types.NEW_MESSAGE_DELETE_ATTACHMENT: {
            return state
                .setIn(['newMessage', 'attachments'], state.getIn(['newMessage', 'attachments'], fromJS([])).delete(action.index))
                .setIn(['state', 'dirty'], true)
        }

        case types.NEW_MESSAGE_RECORD_MACRO: {
            const macroId = action.macro.get('id')

            // if macro already added, do not do anything
            if (state.getIn(['newMessage', 'macros']).find(macro => macro.id === macroId)) {
                return state
            }

            return state.updateIn(['newMessage', 'macros'], macros => macros.push({id: macroId}))
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
            const {channel} = action.message
            let messages = fromJS(action.messages)

            let newState = state
                .mergeDeep({
                    state: {
                        dirty: false,
                        contentState: null,
                        selectionState: null,
                        signatureAdded: false,
                        cacheAdded: false,
                        forceUpdate: true,
                    }
                })

            if (!action.resetMessage) {
                return newState
            }

            return newState.set('newMessage', makeNewMessage(channel, getSourceTypeOfResponse(messages)))
        }

        case types.NEW_MESSAGE_SUBMIT_TICKET_ERROR: {
            return state.setIn(['_internal', 'loading', 'submitMessage'], false)
        }

        case types.NEW_MESSAGE_RESET_FROM_TICKET: {
            const {ticket} = action
            const messages = ticket.get('messages', fromJS([]))

            const sourceType = getSourceTypeOfResponse(messages)

            const newMessage = makeNewMessage(getChannelFromSourceType(sourceType), sourceType)
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

            const newState = state
                .mergeDeep({
                    state: {
                        dirty: false,
                        contentState: null,
                        selectionState: null,
                        signatureAdded: false,
                        cacheAdded: false,
                        appliedMacro: null,
                        forceUpdate: true,
                    }
                })
                .setIn(['_internal', 'loading', 'submitMessage'], false)

            if (!action.resetMessage) {
                return newState
            }

            return newState.set('newMessage', makeNewMessage(channel, getSourceTypeOfResponse(messages)))
        }

        case types.NEW_MESSAGE_FETCH_TICKET_SUCCESS: {
            const {messages} = action.resp
            const sourceType = getSourceTypeOfResponse(messages)
            return state.set('newMessage', makeNewMessage(getChannelFromSourceType(sourceType, messages), sourceType))
                .mergeDeep({
                    state: {
                        dirty: false,
                        contentState: null,
                        selectionState: null,
                        signatureAdded: false,
                        cacheAdded: false,
                    }
                })
        }

        case types.NEW_MESSAGE_SET_SOURCE_TYPE: {
            const {messages, sourceType} = action
            const channel = getChannelFromSourceType(sourceType, messages)

            return state
                .setIn(['newMessage', 'channel'], channel)
                .setIn(['newMessage', 'source', 'type'], sourceType)
                .setIn(['newMessage', 'public'], ticketConfig.isPublic(sourceType))
        }

        case types.NEW_MESSAGE_SET_SOURCE_EXTRA: {
            return state.setIn(['newMessage', 'source', 'extra'], fromJS(action.extra))
        }

        case types.SET_RESPONSE_TEXT: {
            let contentState = action.args.get('contentState') || state.getIn(['state', 'contentState'])
            let selectionState = action.args.get('selectionState') || state.getIn(['state', 'selectionState'])
            const {appliedMacro, forceFocus, forceUpdate} = action

            let context = {
                action,
                state,
                contentState,
                selectionState,
                appliedMacro,
                forceUpdate,
                forceFocus
            }

            context = responseUtils.addCache(context)
            // only deal with signature when email
            if (state.getIn(['newMessage', 'source', 'type']) === 'email') {
                context = responseUtils.addSignature(context)
            }
            context = responseUtils.applyMacro(context)
            responseUtils.updateCache(context)

            contentState = context.contentState
            selectionState = context.selectionState

            // get ids of all mentions within any entities in contentState, only if in internal note
            let ids = fromJS([])
            const isInternalNote = ticketConfig.canLeaveInternalNote(state.getIn(['newMessage', 'source', 'type']))

            if (contentState && isInternalNote) {
                const entityMap = convertToRaw(contentState).entityMap
                _forOwn(entityMap, (entity) => {
                    if (entity.type === 'mention') {
                        // don't push duplicate ids
                        const id = entity.data.mention.get('id')
                        if (!ids.includes(id)) {
                            ids = ids.push(id)
                        }
                    }
                })
            }

            const dirty = contentState
                && contentState.hasText()
                && !responseUtils.onlySignature(contentState, action.currentUser)
            return context.state.mergeDeep({
                newMessage: {
                    body_text: contentState ? contentState.getPlainText() : '',
                    body_html: contentState ? convertToHTML(contentState) : ''
                },
                state: {
                    dirty,
                    forceFocus: !!context.forceFocus,
                    forceUpdate: !!context.forceUpdate,
                    signatureAdded: !!context.signatureAdded,
                    cacheAdded: !!context.cacheAdded,
                }
            })
            // not in the mergeDeep because it would be merged with the previous contentState instead of replacing it
                .setIn(['state', 'contentState'], contentState)
                .setIn(['state', 'selectionState'], selectionState)
                .setIn(['newMessage', 'mention_ids'], ids)
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

            const currentSource = state.getIn(['newMessage', 'source'], fromJS({})).toJS()

            let newReceivers = {}

            if (replaceAll) { // we replace all receivers in source by passed ones
                newReceivers = receivers
            } else { // we merge existing receivers with passed ones
                const currentReceivers = _pick(currentSource, getReceiversProperties())
                newReceivers = _assign(currentReceivers, receivers)
            }

            // removing current receivers from source
            const sourceWithoutReceivers = _omit(currentSource, getReceiversProperties())

            // setting new receivers in source
            return state.setIn(['newMessage', 'source'], fromJS(_assign(sourceWithoutReceivers, newReceivers)))
        }

        default:
            return state
    }
}
