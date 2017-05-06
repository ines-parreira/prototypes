import * as types from './constants'
import * as userTypes from './../users/constants'
import {fromJS} from 'immutable'
import {convertToHTML} from '../../utils'
import * as responseUtils from './responseUtils'
import ticketReplyCache from './ticketReplyCache'
import SocketIO from '../../pages/common/utils/socketio'
import {
    getReceiversProperties,
} from './selectors'
import * as ticketConfig from '../../config/ticket'

import _isUndefined from 'lodash/isUndefined'
import _isString from 'lodash/isString'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import _assign from 'lodash/assign'
import _omit from 'lodash/omit'

import {
    getSourceTypeOfResponse,
    getChannelFromSourceType,
} from './utils'

export const newMessage = (channel, sourceType) => fromJS({
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
    macros: []
})

export const initialState = fromJS({
    state: {
        dirty: false,
        query: '',
        signatureAdded: false,
        cacheAdded: false,
        forceUpdate: true,
        contentState: null,
        selectionState: null,
        appliedMacro: null,
        latestEventDatetime: null
    },
    _internal: {
        displayHistory: false,
        shouldDisplayHistoryOnNextPage: false,
        loading: {
            addAttachment: false,
            fetchTicket: false,
            submitMessage: false,
            deleteMessage: false,
            updateMessageIds: [] // store the ids of all the messages being updated
        },
    },
    events: [],
    messages: [],
    subject: '',
    via: 'helpdesk',
    channel: 'email',
    assignee_user: null,
    status: 'new',
    sender: null,
    requester: null,
    receiver: null,
    priority: 'normal',
    tags: [],
    newMessage: newMessage('email', 'email')
})

const updatableFields = initialState.keySeq().filter(key => !['state', '_internal', 'newMessage'].includes(key))

export default (state = initialState, action) => {
    switch (action.type) {
        case types.ADD_ATTACHMENT_START:
            return state.setIn(['_internal', 'loading', 'addAttachment'], true)

        case types.ADD_ATTACHMENT_SUCCESS: {
            let newState = state

            if (action.ticketId === state.get('id')) {
                newState = newState.mergeDeep({
                    newMessage: {
                        attachments: state.getIn(['newMessage', 'attachments'], fromJS([])).concat(action.resp)
                    },
                    state: {
                        dirty: true
                    }
                })
            }

            return newState.setIn(['_internal', 'loading', 'addAttachment'], false)
        }

        case types.ADD_ATTACHMENTS:
            return state.updateIn(
                ['newMessage', 'attachments'],
                fromJS([]),
                (attachements => attachements.concat(action.args.get('attachments').toJS()))
            )

        case types.ADD_ATTACHMENT_ERROR:
            return state.setIn(['_internal', 'loading', 'addAttachment'], false)

        case types.DELETE_ATTACHMENT:
            return state
                .setIn(['newMessage', 'attachments'], state.getIn(['newMessage', 'attachments'], fromJS([])).delete(action.index))
                .setIn(['state', 'dirty'], true)

        case types.RECORD_MACRO:
            return state.setIn(
                ['newMessage', 'macros'],
                state.getIn(['newMessage', 'macros'], fromJS([])).push({id: action.macro.get('id')})
            )

        case types.SUBMIT_TICKET_MESSAGE_START: {
            return state.mergeDeep({
                state: {
                    dirty: false
                },
                _internal: {
                    loading: {
                        submitMessage: true
                    }
                }
            })
        }

        case types.UPDATE_TICKET_MESSAGE_START: {
            return state.mergeDeep({
                _internal: {
                    loading: {
                        updateMessageIds: [action.messageId]
                    }
                }
            })
        }

        case types.SUBMIT_TICKET_START:
            return state.setIn(['_internal', 'loading', 'submitMessage'], true)

        case types.SUBMIT_TICKET_ERROR:
        case types.SUBMIT_TICKET_MESSAGE_ERROR:
            return state.setIn(['_internal', 'loading', 'submitMessage'], false)

        case types.DELETE_TICKET_MESSAGE_START:
            return state.setIn(['_internal', 'loading', 'deleteMessage'], true)

        case types.DELETE_TICKET_MESSAGE_ERROR:
            return state.setIn(['_internal', 'loading', 'deleteMessage'], false)

        case types.SUBMIT_TICKET_SUCCESS: {
            if (action.resp.id !== state.get('id') && state.get('id')) {
                return state
            }

            // Make sure we reset the cache before we send the message
            ticketReplyCache.delete(state.get('id'))

            const newState = state
                .merge(fromJS(action.resp))
                .mergeDeep({
                    state: {
                        dirty: false,
                        contentState: null,
                        selectionState: null,
                        signatureAdded: false,
                        cacheAdded: false,
                        appliedMacro: null,
                        query: '',
                        forceUpdate: true,
                    }
                })
                .setIn(['_internal', 'loading', 'submitMessage'], false)

            return action.resetMessage ? newState.set('newMessage', newMessage(
                    action.resp.channel,
                    getSourceTypeOfResponse(newState.get('messages'))
                )) : newState
        }

        case types.SUBMIT_TICKET_MESSAGE_SUCCESS: {
            // Make sure we reset the cache before we send the message
            ticketReplyCache.delete(action.resp.ticket_id)

            // If we changed the displayed ticket (e.g. submit and close), we dont want to change the state.
            if (action.resp.ticket_id !== state.get('id') && state.get('id')) {
                return state
            }

            let newState = state

            newState = newState.mergeDeep({
                state: {
                    dirty: false,
                    contentState: null,
                    selectionState: null,
                    signatureAdded: false,
                    cacheAdded: false,
                    query: '',
                    forceUpdate: true,
                }
            }).setIn(['_internal', 'loading', 'submitMessage'], false)


            return action.resetMessage ? newState.set('newMessage', newMessage(
                    action.resp.channel,
                    getSourceTypeOfResponse(newState.get('messages', fromJS([])))
                )) : newState
        }

        case types.FETCH_TICKET_START: {
            if (action.displayLoading) {
                return state.setIn(['_internal', 'loading', 'fetchTicket'], true)
            }
            return state
        }

        case types.FETCH_TICKET_SUCCESS: {
            // if discreet, only update messages
            if (!action.displayLoading) {
                const messages = _get(action, ['resp', 'messages'], [])
                const requesterCustomer = fromJS(_get(action, ['resp', 'requester', 'customer'], {}))

                return state
                    .set('messages', state.get('messages', fromJS([])).mergeDeep(messages))
                    .setIn(['requester', 'customer'], requesterCustomer)
            }

            const newState = state.merge(fromJS(action.resp))
            const sourceType = getSourceTypeOfResponse(newState.get('messages'))

            const ticketId = newState.get('id')
            const requesterId = newState.getIn(['requester', 'id'])

            const io = new SocketIO()
            if (ticketId) {
                io.joinTicket(ticketId)
            }
            if (requesterId) {
                io.joinUser(requesterId)
            }

            return newState.set('newMessage', newMessage(
                getChannelFromSourceType(sourceType, newState.get('messages')),
                sourceType
            ))
                .mergeDeep({
                    state: {
                        dirty: false,
                        contentState: null,
                        selectionState: null,
                        signatureAdded: false,
                        query: ''
                    }
                })
                .setIn(['_internal', 'loading', 'fetchTicket'], false)
        }

        case types.FETCH_TICKET_ERROR: {
            return state.setIn(['_internal', 'loading', 'fetchTicket'], false)
        }

        case types.FETCH_MESSAGE_SUCCESS: {
            if (!_isUndefined(state.get('id')) && state.get('id') === action.resp.ticket_id) {
                return state.setIn(
                    ['messages', state.get('messages').findIndex(message => message.get('id') === action.resp.id)],
                    fromJS(action.resp)
                ).setIn(
                    ['_internal', 'loading', 'updateMessageIds'],
                    state.getIn(['_internal', 'loading', 'updateMessageIds']).filter(v => v !== action.resp.id)
                )
            }

            return state
        }

        case types.CLEAR_TICKET: {
            // @todo(martin): re-set `crossTickets` in _internal
            return initialState.setIn(
                ['_internal', 'shouldDisplayHistoryOnNextPage'],
                state.getIn(['_internal', 'shouldDisplayHistoryOnNextPage'])
            )
        }

        case types.ADD_TICKET_TAGS: {
            let tags = action.args.get('tags')
            let ticketTags = state.get('tags', fromJS([]))
            const existingTagNames = ticketTags.map(x => x.get('name'))

            tags = tags ? tags.split(',').map(t => t.trim()) : []

            tags.forEach((newTag) => {
                if (!existingTagNames.includes(newTag)) {
                    ticketTags = ticketTags.push(fromJS({name: newTag}))
                }
            })

            return state.set('tags', ticketTags)
        }

        case types.REMOVE_TICKET_TAG: {
            const tag = action.args.get('tag')
            const ticketTags = state.get('tags', fromJS([]))
            return state.set('tags', ticketTags.delete(ticketTags.findIndex(t => t.get('name') === tag)))
        }

        case types.TOGGLE_PRIORITY: {
            const priority = action.args.get('priority')
            let newPriority = state.get('priority') === 'normal' ? 'high' : 'normal'

            if (_isString(priority)) {
                newPriority = priority
            }

            return state.set('priority', newPriority)
        }

        case types.SET_AGENT: {
            const assigneeUser = action.args.get('assignee_user') || null // we want null if undefined
            return state.set('assignee_user', fromJS(assigneeUser))
        }

        case types.SET_STATUS: {
            const status = action.args.get('status')
            return state.set('status', status)
        }

        case types.SET_SUBJECT: {
            const subject = action.args.get('subject')
            return state.set('subject', subject)
        }

        case types.SET_SOURCE_TYPE: {
            const channel = getChannelFromSourceType(action.sourceType, state.get('messages'))

            return state
                .setIn(['newMessage', 'channel'], channel)
                .setIn(['newMessage', 'source', 'type'], action.sourceType)
                .setIn(['newMessage', 'public'], ticketConfig.isPublic(action.sourceType))
        }

        case types.APPLY_MACRO: {
            ticketReplyCache.set(action.ticketId, {
                macro: action.macro
            })
            return state.setIn(['state', 'appliedMacro'], action.macro)
        }

        case types.CLEAR_APPLIED_MACRO: {
            ticketReplyCache.set(action.ticketId, {
                macro: null
            })
            return state.setIn(['state', 'appliedMacro'], null)
        }

        case types.UPDATE_ACTION_ARGS_ON_APPLIED: {
            const updatedCache = ticketReplyCache
                .get(action.ticketId)
                .setIn(['macro', 'actions', action.actionIndex.toString(), 'arguments'], action.value)
            ticketReplyCache.set(action.ticketId, updatedCache)
            return state.setIn(['state', 'appliedMacro', 'actions', action.actionIndex.toString(), 'arguments'],
                action.value)
        }

        case types.DELETE_ACTION_ON_APPLIED: {
            const cachedMacro = ticketReplyCache.get(action.ticketId)
            if (cachedMacro.get('macro')) {
                const updatedCache = cachedMacro.deleteIn(['macro', 'actions', action.actionIndex.toString()])
                ticketReplyCache.set(action.ticketId, updatedCache)
            }
            return state.deleteIn(['state', 'appliedMacro', 'actions', action.actionIndex.toString()])
        }

        case types.FETCH_TICKET_REPLY_MACRO: {
            const cache = ticketReplyCache.get(state.get('id')).get('macro')
            return state.setIn(['state', 'appliedMacro'], cache)
        }

        case types.SET_RESPONSE_TEXT: {
            let contentState = action.args.get('contentState') || state.getIn(['state', 'contentState'])
            let selectionState = action.args.get('selectionState') || state.getIn(['state', 'selectionState'])
            const appliedMacro = state.getIn(['state', 'appliedMacro'])

            action.ticketId = state.get('id')

            let context = {
                action,
                state,
                contentState,
                selectionState,
                appliedMacro,
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

            const dirty = contentState && contentState.hasText() && !responseUtils.onlySignature(contentState,
                    action.currentUser)
            return context.state.mergeDeep({
                newMessage: {
                    body_text: contentState ? contentState.getPlainText() : '',
                    body_html: contentState ? convertToHTML(contentState) : ''
                },
                state: {
                    dirty,
                    forceUpdate: !!context.forceUpdate,
                    signatureAdded: !!context.signatureAdded,
                    cacheAdded: !!context.cacheAdded,
                }
            })
            // not in the mergeDeep because it would be merged with the previous contentState instead of replacing it
                .setIn(['state', 'contentState'], contentState)
                .setIn(['state', 'selectionState'], selectionState)
        }

        case types.SET_SENDER: {
            return state.setIn(['newMessage', 'source', 'from'], action.sender)
        }

        case types.SET_RECEIVERS: {
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

        case types.MARK_TICKET_DIRTY:
            return state.setIn(['state', 'dirty'], action.dirty)

        case types.DELETE_TICKET_MESSAGE_SUCCESS:
            return state
                .set(
                    'messages',
                    state.get('messages', fromJS([])).delete(
                        state.get('messages', fromJS([])).findIndex(message => message.get('id') === action.messageId)
                    )
                )
                .setIn(['_internal', 'loading', 'deleteMessage'], false)

        case types.TOGGLE_HISTORY: {
            const displayHistory = action.state !== undefined
                ? action.state
                : !state.getIn(['_internal', 'displayHistory'])

            return state.setIn(['_internal', 'displayHistory'], displayHistory)
        }

        case types.DISPLAY_HISTORY_ON_NEXT_PAGE:
            return state.setIn(['_internal', 'shouldDisplayHistoryOnNextPage'], fromJS(action.state))

        case userTypes.MERGE_USERS_SUCCESS: {
            if (action.resp && state.getIn(['requester', 'id']) === action.resp.id) {
                return state.set('requester', fromJS(action.resp))
            }
            return state
        }

        case types.MERGE_TICKET: {
            const {ticket} = action

            // if received ticket data does not concern current ticket, do nothing
            if (ticket.get('id') !== state.get('id')) {
                return state
            }

            let newState = state

            // merge received ticket with current ticket
            updatableFields.forEach((key) => {
                if (ticket.has(key)) {
                    newState = newState.set(key, ticket.get(key))
                }
            })

            return newState
        }

        case types.MERGE_REQUESTER: {
            const {user} = action
            const userData = fromJS(user)

            // if received user data does not concern current requester of ticket, do nothing
            if (userData.get('id') !== state.getIn(['requester', 'id'])) {
                return state
            }

            return state.set('requester', userData)
        }

        default:
            return state
    }
}
