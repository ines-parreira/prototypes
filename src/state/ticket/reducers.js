import {fromJS} from 'immutable'

import * as customerTypes from '../customers/constants'
import ticketReplyCache from '../newMessage/ticketReplyCache'
import * as newMessageTypes from '../newMessage/constants'
import {compare} from '../../utils'

import {getPendingMessageIndex} from './utils'
import * as types from './constants'

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
        },
        pendingMessages: [],
    },
    events: [],
    messages: [],
    subject: '',
    via: 'helpdesk',
    channel: 'email',
    assignee_user: null,
    assignee_team: null,
    status: 'open',
    spam: false,
    customer: null,
    priority: 'normal',
    tags: [],
    trashed_datetime: null,
    reply_options: {
        email: {
            answerable: true
        }
    }
})

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START: {
            if (!action.retry) {
                // Make sure we reset the cache before we send the message
                ticketReplyCache.delete(state.get('id'))
            }

            const message = fromJS({
                // temporary props
                _internal: {
                    id: action.messageId,
                    status: action.status
                },
                // for sorting
                created_datetime: new Date().toISOString(),
                // for retry
                originalMessage: action.message,
            }).mergeDeep(action.message)

            let newState = state

            const messageIndex = newState
                .getIn(['_internal', 'pendingMessages'], fromJS([]))
                .findIndex((message) => message.getIn(['_internal', 'id']) === action.messageId)

            if (action.retry && ~messageIndex) {
                // update the retried message
                return newState
                    .deleteIn(['_internal', 'pendingMessages', messageIndex, 'failed_datetime'])
            }

            return newState.updateIn(['_internal', 'pendingMessages'], (messages) => messages.unshift(message))
        }

        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR: {
            const messageIndex = state
                .getIn(['_internal', 'pendingMessages'], fromJS([]))
                .findIndex((message) => message.getIn(['_internal', 'id']) === action.messageId)

            if (!~messageIndex) {
                return state
            }

            return state
                .updateIn(['_internal', 'pendingMessages', messageIndex], (message) => {
                    return message.mergeDeep({
                        failed_datetime: new Date().toISOString()
                    })
                })
        }

        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS: {
            // Make sure we reset the cache before we send the message
            ticketReplyCache.delete(state.get('id'))

            return state.merge(fromJS(action.resp))
        }

        case types.FETCH_TICKET_START: {
            return state.setIn(['_internal', 'loading', 'fetchTicket'], true)
        }

        case types.FETCH_TICKET_SUCCESS: {
            const newState = state.merge(action.resp)
            return newState.setIn(['_internal', 'loading', 'fetchTicket'], false)
        }

        case types.FETCH_TICKET_ERROR: {
            return state.setIn(['_internal', 'loading', 'fetchTicket'], false)
        }

        case types.CLEAR_TICKET: {
            return initialState.setIn(
                ['_internal', 'shouldDisplayHistoryOnNextPage'],
                state.getIn(['_internal', 'shouldDisplayHistoryOnNextPage'])
            )
        }

        case types.ADD_TICKET_TAGS: {
            let tags = action.args.get('tags')
            let ticketTags = state.get('tags', fromJS([]))
            const existingTagNames = ticketTags.map((x) => x.get('name'))

            tags = tags ? tags.split(',').map((t) => t.trim()) : []

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

            const index = ticketTags.findIndex((t) => t.get('name') === tag)

            if (!~index) {
                return state
            }

            return state.set('tags', ticketTags.delete(index))
        }

        case types.SET_TICKET_MESSAGE_REQUEST: {
            return state.merge({
                messages: state.get('messages').map((m) => {
                    if (m.get('id') === action.messageId) {
                        return m.set('request_id', action.requestId)
                    }
                    return m
                })
            })
        }

        case types.REMOVE_TICKET_MESSAGE_REQUEST: {
            return state.merge({
                messages: state.get('messages').map((m) => {
                    if (m.get('id') === action.messageId) {
                        return m.set('request_id', null)
                    }
                    return m
                })
            })
        }

        case types.SET_SPAM: {
            return state.set('spam', action.spam)
        }

        case types.SET_TRASHED: {
            return state.set('trashed_datetime', action.trashed_datetime)
        }

        case types.SET_AGENT: {
            const assigneeUser = action.args.get('assignee_user') || null // we want null if undefined
            return state.set('assignee_user', fromJS(assigneeUser))
        }

        case types.SET_TEAM: {
            const assigneeTeam = action.args.get('assignee_team') || null // we want null if undefined
            return state.set('assignee_team', fromJS(assigneeTeam))
        }

        case types.SET_STATUS: {
            const status = action.args.get('status')
            return state.set('status', status)
        }

        case types.SET_SUBJECT: {
            const subject = action.args.get('subject')
            return state.set('subject', subject)
        }

        case types.SET_CUSTOMER: {
            const customer = action.args.get('customer')
            return state.set('customer', customer)
        }

        case types.SET_SNOOZE: {
            return state
                .set('snooze_datetime', action.snooze_datetime)
                .set('status', action.status)
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
                .setIn(['macro', 'actions', String(action.actionIndex), 'arguments'], action.value)
            ticketReplyCache.set(action.ticketId, updatedCache)
            return state.setIn(['state', 'appliedMacro', 'actions', String(action.actionIndex), 'arguments'],
                action.value)
        }

        case types.DELETE_ACTION_ON_APPLIED: {
            const cachedMacro = ticketReplyCache.get(action.ticketId)
            if (cachedMacro.get('macro')) {
                const updatedCache = cachedMacro.deleteIn(['macro', 'actions', String(action.actionIndex)])
                ticketReplyCache.set(action.ticketId, updatedCache)
            }
            return state.deleteIn(['state', 'appliedMacro', 'actions', String(action.actionIndex)])
        }

        case types.MARK_TICKET_DIRTY:
            return state.setIn(['state', 'dirty'], action.dirty)

        case types.DELETE_TICKET_MESSAGE_SUCCESS:
            return state
                .update('messages', (messages) => {
                    const index = messages.findIndex((message) => message.get('id') === action.messageId)

                    if (!~index) {
                        return messages
                    }

                    return messages.delete(index)
                })

        case types.TOGGLE_HISTORY: {
            const displayHistory = action.state !== undefined
                ? action.state
                : !state.getIn(['_internal', 'displayHistory'])

            return state.setIn(['_internal', 'displayHistory'], displayHistory)
        }

        case types.DISPLAY_HISTORY_ON_NEXT_PAGE:
            return state.setIn(['_internal', 'shouldDisplayHistoryOnNextPage'], action.state)

        case customerTypes.MERGE_CUSTOMERS_SUCCESS: {
            if (action.resp && state.getIn(['customer', 'id']) === action.resp.id) {
                return state.set('customer', fromJS(action.resp))
            }
            return state
        }

        case types.MERGE_TICKET: {
            const {ticket, messagesDifference} = action

            // merge received ticket with current ticket
            let newState = state.merge(ticket)

            // order messages by created datetime
            newState = newState.update('messages', (messages) => {
                return messages.sort((a, b) => compare(a.get('created_datetime'), b.get('created_datetime')))
            })

            // sockets are faster then the success callback,
            // so we need to remove pending messages here to avoid `jumping` messages
            if (messagesDifference) {
                // search for matching pending message from last messages to first ones
                const currentMessages = newState.get('messages').reverse()
                currentMessages.forEach((message) => {
                    const pendingMessages = newState.getIn(['_internal', 'pendingMessages']) || fromJS([])
                    // pending messages don't have an id we can match on
                    const pendingIndex = getPendingMessageIndex(pendingMessages.toJS(), message.toJS())

                    if (~pendingIndex) {
                        // remove pending message
                        newState = newState.updateIn(['_internal', 'pendingMessages'], (messages) => {
                            return messages.splice(pendingIndex, 1)
                        })
                    }
                })
            }

            return newState
        }

        case types.MERGE_CUSTOMER: {
            const {customer} = action
            const customerData = fromJS(customer)

            // if received customer data does not concern current customer of ticket, do nothing
            if (customerData.get('id') !== state.getIn(['customer', 'id'])) {
                return state
            }

            return state.set('customer', customerData)
        }

        case types.DELETE_TICKET_PENDING_MESSAGE: {
            return state.updateIn(['_internal', 'pendingMessages'], (messages) => {
                let messageIndex = messages
                    .findIndex((message) => {
                        return message.getIn(['_internal', 'id']) === action.message.getIn(['_internal', 'id'])
                    })

                if (~messageIndex) {
                    return messages.splice(messageIndex, 1)
                }

                return messages
            })
        }

        default:
            return state
    }
}
