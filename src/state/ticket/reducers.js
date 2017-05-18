import * as types from './constants'
import * as userTypes from './../users/constants'
import {fromJS} from 'immutable'
import ticketReplyCache from '../newMessage/ticketReplyCache'
import SocketIO from '../../pages/common/utils/socketio'

import * as newMessageTypes from '../newMessage/constants'

import _isUndefined from 'lodash/isUndefined'
import _isString from 'lodash/isString'
import _get from 'lodash/get'

export const initialState = fromJS({
    state: {
        dirty: false,
        latestEventDatetime: null,
        appliedMacro: null,
    },
    _internal: {
        displayHistory: false,
        shouldDisplayHistoryOnNextPage: false,
        loading: {
            fetchTicket: false,
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
})

const updatableFields = initialState.keySeq().filter(key => !['state', '_internal'].includes(key))

export default (state = initialState, action) => {
    switch (action.type) {
        case types.UPDATE_TICKET_MESSAGE_START: {
            return state.mergeDeep({
                _internal: {
                    loading: {
                        updateMessageIds: [action.messageId]
                    }
                }
            })
        }

        case types.DELETE_TICKET_MESSAGE_START:
            return state.setIn(['_internal', 'loading', 'deleteMessage'], true)

        case types.DELETE_TICKET_MESSAGE_ERROR:
            return state.setIn(['_internal', 'loading', 'deleteMessage'], false)

        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS: {
            // Make sure we reset the cache before we send the message
            ticketReplyCache.delete(state.get('id'))

            return state.merge(fromJS(action.resp))
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

            const ticketId = newState.get('id')
            const requesterId = newState.getIn(['requester', 'id'])

            const io = new SocketIO()
            if (ticketId) {
                io.joinTicket(ticketId)
            }
            if (requesterId) {
                io.joinUser(requesterId)
            }

            return newState
        }

        case newMessageTypes.NEW_MESSAGE_FETCH_TICKET_SUCCESS: {
            return state.setIn(['_internal', 'loading', 'fetchTicket'], false)
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

        case types.FETCH_TICKET_REPLY_MACRO: {
            const cache = ticketReplyCache.get(state.get('id')).get('macro')
            return state.setIn(['state', 'appliedMacro'], cache)
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
