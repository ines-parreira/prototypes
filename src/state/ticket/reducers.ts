import {fromJS, Map, List} from 'immutable'
import moment from 'moment'

import {TicketAuditLogEvent} from '../../constants/integrations/types/event'
import * as customerTypes from '../customers/constants.js'
import ticketReplyCache from '../newMessage/ticketReplyCache'
import * as newMessageTypes from '../newMessage/constants'
import {compare} from '../../utils'
import {GorgiasAction} from '../types'

import {getPendingMessageIndex, parseTimedelta} from './utils'
import * as types from './constants'
import {
    deduplicateAuditLogEvents,
    shouldDeduplicateAuditLogEvents,
} from './helpers'
import {TicketState} from './types'

export const initialState: TicketState = fromJS({
    state: {
        dirty: false,
        latestEventDatetime: null,
        appliedMacro: null,
    },
    _internal: {
        displayHistory: false,
        shouldDisplayAuditLogEvents: false,
        shouldDisplayHistoryOnNextPage: false,
        loading: {
            fetchTicket: false,
            deleteMessage: false,
            setSpam: false,
            setTrash: false,
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
            answerable: true,
        },
        'internal-note': {
            answerable: true,
        },
    },
    is_unread: false,
})

export default function reducer(
    state: TicketState = initialState,
    action: GorgiasAction
): TicketState {
    switch (action.type) {
        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START: {
            if (!action.retry) {
                // Make sure we reset the cache before we send the message
                ticketReplyCache.delete(state.get('id'))
            }

            const message = (
                fromJS({
                    // temporary props
                    _internal: {
                        id: action.messageId,
                        status: action.status,
                    },
                    // for sorting
                    created_datetime: new Date().toISOString(),
                    // for retry
                    originalMessage: action.message,
                }) as Map<any, any>
            ).mergeDeep(action.message as any)

            const newState = state

            const messageIndex = (
                newState.getIn(
                    ['_internal', 'pendingMessages'],
                    fromJS([])
                ) as List<any>
            ).findIndex(
                (message: Map<any, any>) =>
                    message.getIn(['_internal', 'id']) === action.messageId
            )

            if (action.retry && ~messageIndex) {
                // update the retried message
                return newState.deleteIn([
                    '_internal',
                    'pendingMessages',
                    messageIndex,
                    'failed_datetime',
                ])
            }

            return newState.updateIn(
                ['_internal', 'pendingMessages'],
                (messages: List<any>) => messages.unshift(message)
            )
        }

        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR: {
            const messageIndex = (
                state.getIn(
                    ['_internal', 'pendingMessages'],
                    fromJS([])
                ) as List<any>
            ).findIndex(
                (message: Map<any, any>) =>
                    message.getIn(['_internal', 'id']) === action.messageId
            )

            if (!~messageIndex) {
                return state
            }

            return state.updateIn(
                ['_internal', 'pendingMessages', messageIndex],
                (message: Map<any, any>) => {
                    return message.mergeDeep({
                        failed_datetime: new Date().toISOString(),
                    })
                }
            )
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
            const newState = state.merge(action.resp as Map<any, any>)
            return newState.setIn(
                ['_internal', 'loading', 'fetchTicket'],
                false
            )
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
            let tags: string | string[] = action.args?.get('tags') as string
            let ticketTags = state.get('tags', fromJS([])) as List<any>
            const existingTagNames = ticketTags.map(
                (x: Map<any, any>) => x.get('name') as string
            )

            tags = tags ? tags.split(',').map((t) => t.trim()) : []

            tags.forEach((newTag) => {
                if (!existingTagNames.includes(newTag)) {
                    ticketTags = ticketTags.push(fromJS({name: newTag}))
                }
            })

            return state.set('tags', ticketTags)
        }

        case types.REMOVE_TICKET_TAG: {
            const tag = action.args?.get('tag') as string
            const ticketTags = state.get('tags', fromJS([])) as List<any>

            const index = ticketTags.findIndex(
                (t: Map<any, any>) => t.get('name') === tag
            )

            if (!~index) {
                return state
            }

            return state.set('tags', ticketTags.delete(index))
        }

        case types.SET_TICKET_MESSAGE_REQUEST: {
            return state.merge({
                messages: (state.get('messages') as List<any>).map(
                    (m: Map<any, any>) => {
                        if (m.get('id') === action.messageId) {
                            return m.set('request_id', action.requestId)
                        }
                        return m
                    }
                ),
            })
        }

        case types.REMOVE_TICKET_MESSAGE_REQUEST: {
            return state.merge({
                messages: (state.get('messages') as List<any>).map(
                    (m: Map<any, any>) => {
                        if (m.get('id') === action.messageId) {
                            return m.set('request_id', null)
                        }
                        return m
                    }
                ),
            })
        }

        case types.SET_SPAM_START: {
            return state
                .set('spam', action.spam)
                .setIn(['_internal', 'loading', 'setSpam'], true)
        }

        case types.SET_SPAM_SUCCESS: {
            return state
                .set('spam', false)
                .setIn(['_internal', 'loading', 'setSpam'], false)
        }

        case types.SET_TRASHED_START: {
            return state
                .set('trashed_datetime', action.trashed_datetime)
                .setIn(['_internal', 'loading', 'setTrash'], true)
        }

        case types.SET_TRASHED_SUCCESS: {
            return state
                .set('trashed_datetime', null)
                .setIn(['_internal', 'loading', 'setTrash'], false)
        }

        case types.SET_AGENT: {
            const assigneeUser = action.args?.get('assignee_user') || null // we want null if undefined
            return state.set('assignee_user', fromJS(assigneeUser))
        }

        case types.SET_TEAM: {
            const assigneeTeam = action.args?.get('assignee_team') || null // we want null if undefined
            return state.set('assignee_team', fromJS(assigneeTeam))
        }

        case types.SET_STATUS: {
            const status = action.args?.get('status')
            return state.set('status', status)
        }

        case types.SET_SUBJECT: {
            const subject = action.args?.get('subject')
            return state.set('subject', subject)
        }

        case types.SET_CUSTOMER: {
            const customer = action.args?.get('customer')
            return state.set('customer', customer)
        }

        case types.SNOOZE_TICKET: {
            const snoozeDuration = action.args?.get('snooze_timedelta')
            if (snoozeDuration) {
                return state
                    .set(
                        'snooze_datetime',
                        moment().add(parseTimedelta(snoozeDuration)).format()
                    )
                    .set('status', 'closed')
            }
            return state
                .set('snooze_datetime', action.snooze_datetime)
                .set('status', action.status)
        }

        case types.APPLY_MACRO: {
            ticketReplyCache.set(action.ticketId as string, {
                macro: action.macro,
            })
            return state.setIn(['state', 'appliedMacro'], action.macro)
        }

        case types.CLEAR_APPLIED_MACRO: {
            ticketReplyCache.set(action.ticketId as string, {
                macro: null,
            })
            return state.setIn(['state', 'appliedMacro'], null)
        }

        case types.FETCH_TICKET_REPLY_MACRO: {
            const cache = ticketReplyCache.get(state.get('id')).get('macro')
            return state.setIn(['state', 'appliedMacro'], cache)
        }

        case types.UPDATE_ACTION_ARGS_ON_APPLIED: {
            const updatedCache = ticketReplyCache
                .get(action.ticketId as string)
                .setIn(
                    [
                        'macro',
                        'actions',
                        String(action.actionIndex),
                        'arguments',
                    ],
                    action.value
                )
            ticketReplyCache.set(action.ticketId as string, updatedCache)
            return state.setIn(
                [
                    'state',
                    'appliedMacro',
                    'actions',
                    String(action.actionIndex),
                    'arguments',
                ],
                action.value
            )
        }

        case types.DELETE_ACTION_ON_APPLIED: {
            const cachedMacro = ticketReplyCache.get(action.ticketId as string)
            if (cachedMacro.get('macro')) {
                const updatedCache = cachedMacro.deleteIn([
                    'macro',
                    'actions',
                    String(action.actionIndex),
                ])
                ticketReplyCache.set(action.ticketId as string, updatedCache)
            }
            return state.deleteIn([
                'state',
                'appliedMacro',
                'actions',
                String(action.actionIndex),
            ])
        }

        case types.MARK_TICKET_DIRTY:
            return state.setIn(['state', 'dirty'], action.dirty)

        case types.DELETE_TICKET_MESSAGE_SUCCESS:
            return state.update('messages', (messages: List<any>) => {
                const index = messages.findIndex(
                    (message: Map<any, any>) =>
                        message.get('id') === action.messageId
                )

                if (!~index) {
                    return messages
                }

                return messages.delete(index)
            })

        case types.TOGGLE_HISTORY: {
            const displayHistory =
                action.state !== undefined
                    ? action.state
                    : !state.getIn(['_internal', 'displayHistory'])

            return state.setIn(['_internal', 'displayHistory'], displayHistory)
        }

        case types.DISPLAY_HISTORY_ON_NEXT_PAGE:
            return state.setIn(
                ['_internal', 'shouldDisplayHistoryOnNextPage'],
                action.state
            )

        case customerTypes.MERGE_CUSTOMERS_SUCCESS: {
            if (
                action.resp &&
                state.getIn(['customer', 'id']) ===
                    (action.resp as Record<string, unknown>).id
            ) {
                return state.set('customer', fromJS(action.resp))
            }
            return state
        }

        case types.MERGE_TICKET: {
            const {ticket, messagesDifference} = action

            // merge received ticket with current ticket
            let newState = state.merge(ticket as Map<any, any>)

            // keep audit log events
            const auditLogEvents = (state.get('events') as List<any>).filter(
                (event: Map<any, any>) =>
                    Object.values(TicketAuditLogEvent).includes(
                        event.get('type')
                    ) &&
                    event.get('object_id') === ticket?.get('id') &&
                    (newState.get('events') as List<any>).every(
                        (existingEvent: Map<any, any>) =>
                            existingEvent.get('id') !== event.get('id')
                    )
            )

            newState = newState.updateIn(['events'], (events: List<any>) =>
                events.concat(auditLogEvents)
            )

            // order messages by created datetime
            newState = newState.update('messages', (messages: List<any>) => {
                return messages.sort((a: Map<any, any>, b: Map<any, any>) =>
                    compare(
                        a.get('created_datetime'),
                        b.get('created_datetime')
                    )
                )
            })

            // sockets are faster then the success callback,
            // so we need to remove pending messages here to avoid `jumping` messages
            if (messagesDifference) {
                // search for matching pending message from last messages to first ones
                const currentMessages = (
                    newState.get('messages') as List<any>
                ).reverse()
                currentMessages.forEach((message: Map<any, any>) => {
                    const pendingMessages = (newState.getIn([
                        '_internal',
                        'pendingMessages',
                    ]) || fromJS([])) as List<any>
                    // pending messages don't have an id we can match on
                    const pendingIndex = getPendingMessageIndex(
                        pendingMessages.toJS(),
                        message.toJS()
                    )

                    if (~pendingIndex) {
                        // remove pending message
                        newState = newState.updateIn(
                            ['_internal', 'pendingMessages'],
                            (messages: List<any>) => {
                                return messages.splice(pendingIndex, 1)
                            }
                        )
                    }
                })
            }

            return newState
        }

        case types.MERGE_CUSTOMER: {
            const {customer} = action
            const customerData = fromJS(customer) as Map<any, any>

            // if received customer data does not concern current customer of ticket, do nothing
            if (customerData.get('id') !== state.getIn(['customer', 'id'])) {
                return state
            }

            return state.set('customer', customerData)
        }

        case types.DELETE_TICKET_PENDING_MESSAGE: {
            return state.updateIn(
                ['_internal', 'pendingMessages'],
                (messages: List<any>) => {
                    const messageIndex = messages.findIndex(
                        (message: Map<any, any>) => {
                            return (
                                message.getIn(['_internal', 'id']) ===
                                (
                                    action.message as unknown as Map<any, any>
                                ).getIn(['_internal', 'id'])
                            )
                        }
                    )

                    if (~messageIndex) {
                        return messages.splice(messageIndex, 1)
                    }

                    return messages
                }
            )
        }

        case types.DISPLAY_TICKET_AUDIT_LOG_EVENTS:
            return state.setIn(
                ['_internal', 'shouldDisplayAuditLogEvents'],
                true
            )

        case types.HIDE_TICKET_AUDIT_LOG_EVENTS:
            return state.setIn(
                ['_internal', 'shouldDisplayAuditLogEvents'],
                false
            )

        case types.ADD_TICKET_AUDIT_LOG_EVENTS:
            return state.updateIn(['events'], (events: List<any>) => {
                let results = events
                ;(action.payload as List<any>).forEach(
                    (eventToDisplay: Map<any, any>) => {
                        const index = results.findIndex(
                            (event: Map<any, any>) =>
                                event.get('id') === eventToDisplay.get('id')
                        )

                        if (index === -1) {
                            results = results.push(eventToDisplay)
                        } else {
                            results = results.set(index, eventToDisplay)
                        }
                    }
                )

                return shouldDeduplicateAuditLogEvents(
                    state.get('created_datetime')
                )
                    ? deduplicateAuditLogEvents(results)
                    : results
            })

        case types.REMOVE_TICKET_AUDIT_LOG_EVENTS:
            return state.updateIn(['events'], (events: List<any>) =>
                events.filter(
                    (event: Map<any, any>) =>
                        !Object.values(TicketAuditLogEvent).includes(
                            event.get('type')
                        )
                )
            )

        case types.TICKET_MESSAGE_DELETED:
            return state.updateIn(
                ['_internal', 'pendingMessages'],
                (messages: List<any>) => {
                    const index = messages.findIndex(
                        (message: Map<any, any>) =>
                            message.getIn(['_internal', 'id']) ===
                            parseInt(action.payload as string)
                    )

                    if (!~index) {
                        return messages
                    }
                    return messages.delete(index)
                }
            )

        case types.SEND_INTENT_FEEDBACK_SUCCESS:
            return state.update('messages', (messages: List<any>) =>
                messages.map((message: Map<any, any>) => {
                    const {messageId, intents} = action.payload as {
                        messageId: number
                        intents: any
                    }
                    return message.get('id') === messageId
                        ? message.set('intents', fromJS(intents))
                        : message
                })
            )
        default:
            return state
    }
}
