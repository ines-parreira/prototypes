import { fromJS, List, Map } from 'immutable'
import moment from 'moment'

import { FETCH_TICKET_REPLY_MACRO } from 'common/state'
import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import { CustomFieldState } from 'custom-fields/types'
import {
    ShopperAddress,
    ShopperOrder,
} from 'models/customerEcommerceData/types'
import {
    SATISFACTION_SURVEY_DETAIL_EVENT_TYPES,
    TICKET_EVENT_TYPES,
} from 'models/event/types'
import { MacroActionName } from 'models/macroAction/types'
import { Ticket } from 'models/ticket/types'
import * as customerTypes from 'state/customers/constants'
import * as newMessageTypes from 'state/newMessage/constants'
import ticketReplyCache from 'state/newMessage/ticketReplyCache'
import { GorgiasAction } from 'state/types'
import {
    CUSTOMER_ECOMMERCE_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_KEY,
} from 'state/widgets/constants'
import { parseTimeDelta } from 'tickets/common/utils'
import { compare } from 'utils'

import * as types from './constants'
import {
    deduplicateAuditLogEvents,
    shouldDeduplicateAuditLogEvents,
} from './helpers'
import { TicketState } from './types'
import { getPendingMessageIndex, mergeActions } from './utils'

export const initialState: TicketState = fromJS({
    state: {
        dirty: false,
        latestEventDatetime: null,
        appliedMacro: null,
        hasAttemptedToCloseTicket: false,
    },
    _internal: {
        shouldDisplayAuditLogEvents: false,
        loading: {
            fetchTicket: false,
            deleteMessage: false,
            setSpam: false,
            setTrash: false,
        },
        pendingMessages: [],
        isShopperTyping: false,
        isShopperTypingTimeoutId: undefined,
        isPartialUpdating: false,
    },
    custom_fields: {},
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
    action: GorgiasAction,
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
                    fromJS([]),
                ) as List<any>
            ).findIndex(
                (message: Map<any, any>) =>
                    message.getIn(['_internal', 'id']) === action.messageId,
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
                (messages: List<any>) => messages.unshift(message),
            )
        }

        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR: {
            const messageIndex = (
                state.getIn(
                    ['_internal', 'pendingMessages'],
                    fromJS([]),
                ) as List<any>
            ).findIndex(
                (message: Map<any, any>) =>
                    message.getIn(['_internal', 'id']) === action.messageId,
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
                },
            )
        }

        case newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS: {
            // Make sure we reset the cache before we send the message
            ticketReplyCache.delete(state.get('id'))
            return state.mergeDeep(action.resp as Ticket)
        }

        case types.FETCH_TICKET_START: {
            return state.setIn(['_internal', 'loading', 'fetchTicket'], true)
        }

        case types.FETCH_TICKET_SUCCESS: {
            const newState = state.merge(action.response as Map<any, any>)
            return newState.setIn(
                ['_internal', 'loading', 'fetchTicket'],
                false,
            )
        }

        case types.FETCH_TICKET_ERROR: {
            return state.setIn(['_internal', 'loading', 'fetchTicket'], false)
        }

        case types.CLEAR_TICKET: {
            return initialState
        }

        case types.ADD_TICKET_TAG: {
            const tag: Map<any, any> = action.args?.get('tag')
            let ticketTags = state.get('tags', fromJS([])) as List<
                Map<string, string>
            >
            const existingTagNames = ticketTags.map((x) => x?.get('name'))

            if (tag && !existingTagNames.includes(tag.get('name'))) {
                ticketTags = ticketTags.push(
                    fromJS({
                        id: tag.get('id'),
                        name: (tag.get('name') as string)?.trim() ?? '',
                        decoration: tag.get('decoration'),
                    }),
                )
            }

            return state.set('tags', ticketTags)
        }

        case types.REMOVE_TICKET_TAG: {
            const tag = action.args?.get('tag') as string
            const ticketTags = state.get('tags', fromJS([])) as List<any>

            const index = ticketTags.findIndex(
                (t: Map<any, any>) => t.get('name') === tag,
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
                    },
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
                    },
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
                        moment().add(parseTimeDelta(snoozeDuration)).format(),
                    )
                    .set('status', 'closed')
            }
            return state
                .set('snooze_datetime', action.snooze_datetime)
                .set('status', action.status)
        }

        case types.APPLY_MACRO: {
            // Try to merge actions with the previous applied macro
            if (action.macro) {
                const oldActions = (
                    state.getIn(
                        ['state', 'appliedMacro', 'actions'],
                        fromJS([]),
                    ) as List<any>
                ).filter(
                    (action: Map<any, any>) =>
                        ![
                            MacroActionName.SetResponseText,
                            MacroActionName.AddAttachments,
                        ].includes(action.get('name')),
                ) as List<any>

                if (oldActions.size)
                    action.macro = action.macro?.set(
                        'actions',
                        mergeActions(
                            oldActions,
                            action.macro.get('actions', fromJS([])),
                        ),
                    )
            }
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

        case types.SET_TOP_RANK_MACRO_STATE: {
            ticketReplyCache.set(action.ticketId as string, {
                topRankMacroState: action.topRankMacroState,
            })
            return state.setIn(
                ['state', 'topRankMacroState'],
                fromJS(action.topRankMacroState),
            )
        }

        case FETCH_TICKET_REPLY_MACRO: {
            const cache = ticketReplyCache.get(state.get('id'))
            return state
                .setIn(['state', 'appliedMacro'], cache.get('macro'))
                .setIn(
                    ['state', 'topRankMacroState'],
                    cache.get('topRankMacroState'),
                )
        }

        case types.UPDATE_ACTION_ARGS_ON_APPLIED: {
            if (action.ticketId) {
                let updatedCache = ticketReplyCache.get(
                    action.ticketId as string,
                )

                const macro = updatedCache.get('macro')
                // setIn will fail with `invalid keyPath` if the first key is null
                if (!macro) {
                    updatedCache = updatedCache.set('macro', Map<any, any>())
                }
                ticketReplyCache.set(
                    action.ticketId as string,
                    updatedCache.setIn(
                        [
                            'macro',
                            'actions',
                            String(action.actionIndex),
                            'arguments',
                        ],
                        action.value,
                    ),
                )
            }

            return state.getIn(['state', 'appliedMacro'])
                ? state.setIn(
                      [
                          'state',
                          'appliedMacro',
                          'actions',
                          String(action.actionIndex),
                          'arguments',
                      ],
                      action.value,
                  )
                : state
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
                        message.get('id') === action.messageId,
                )

                if (!~index) {
                    return messages
                }

                return messages.delete(index)
            })

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
            const { ticket, messagesDifference } = action

            // Make sure that custom fields
            // are not reset by error when receiving new messages or merging ticket
            const oldCustomFields = state.get('custom_fields') as Map<any, any>
            const newCustomFields = ticket?.get('custom_fields') as Map<
                any,
                any
            >
            const mergedCustomFields =
                oldCustomFields?.mergeDeep(newCustomFields)

            // Make sure that reply_options
            // are not reset by error when receiving new messages or merging ticket
            const oldReplyOptions = state.get('reply_options') as Map<any, any>
            const newReplyOptions = ticket?.get('reply_options') as Map<
                any,
                any
            >
            const mergedReplyOptions =
                oldReplyOptions?.mergeDeep(newReplyOptions)

            // merge received ticket with current ticket
            let newState = state.merge(ticket as Map<any, any>)
            newState = newState
                .set('custom_fields', mergedCustomFields)
                .set('reply_options', mergedReplyOptions)

            // Keep the old ticket.customer.{dataKey}
            // if the new ticket.customer doesn't have a {dataKey}.
            // This could happen, for example, when we receive
            // `ticket-updated` event having attached a ticket.customer object
            // that did not have loaded the external_data or ecommerce_data
            for (const dataKey of [
                CUSTOMER_EXTERNAL_DATA_KEY,
                CUSTOMER_ECOMMERCE_DATA_KEY,
            ]) {
                if (ticket?.getIn(['customer', dataKey])) continue

                const newCustomerId = ticket?.getIn(['customer', 'id'])
                const oldCustomerId = state.getIn(['customer', 'id'])

                if (newCustomerId === oldCustomerId) {
                    const oldData = state.getIn(['customer', dataKey])
                    if (oldData) {
                        newState = newState.setIn(
                            ['customer', dataKey],
                            oldData,
                        )
                    }
                }
            }

            // keep audit log events
            const auditLogEvents = (state.get('events') as List<any>).filter(
                (event: Map<any, any>) =>
                    Object.values(TICKET_EVENT_TYPES).includes(
                        event.get('type'),
                    ) &&
                    event.get('object_id') === ticket?.get('id') &&
                    (newState.get('events') as List<any>).every(
                        (existingEvent: Map<any, any>) =>
                            existingEvent.get('id') !== event.get('id'),
                    ),
            )

            newState = newState.updateIn(['events'], (events: List<any>) =>
                events.concat(auditLogEvents),
            )

            // order messages by created datetime
            newState = newState.update('messages', (messages: List<any>) => {
                return messages.sort((a: Map<any, any>, b: Map<any, any>) =>
                    compare(
                        a.get('created_datetime'),
                        b.get('created_datetime'),
                    ),
                )
            })

            // sockets are faster than the success callback,
            // so we need to remove pending messages here to avoid `jumping` messages
            if (messagesDifference) {
                // search for matching pending message from last messages to first ones
                const currentMessages = (
                    newState.get('messages') as List<any>
                ).reverse()
                const pendingMessages = (
                    (newState.getIn(['_internal', 'pendingMessages']) ||
                        fromJS([])) as List<any>
                ).toJS()

                currentMessages.forEach((message: Map<any, any>) => {
                    // pending messages don't have an id we can match on
                    const pendingIndex = getPendingMessageIndex(
                        pendingMessages,
                        message.toJS(),
                    )

                    if (~pendingIndex) {
                        // remove pending message
                        newState = newState.updateIn(
                            ['_internal', 'pendingMessages'],
                            (messages: List<any>) => {
                                return messages.splice(pendingIndex, 1)
                            },
                        )
                    }
                })
            }

            return newState
        }

        case customerTypes.SUBMIT_CUSTOMER_SUCCESS:
        case types.MERGE_CUSTOMER: {
            // if action is from SUBMIT_CUSTOMER_SUCCESS, customer is in the resp key
            let customer = action.customer || action.resp

            let customerData = fromJS(customer) as Map<any, any>

            // if received customer data does not concern current customer of ticket, do nothing
            if (customerData.get('id') !== state.getIn(['customer', 'id'])) {
                return state
            }

            // Keep the old customer.{dataKey}
            // if the new customer doesn't have a {dataKey}.
            // This could happen, for example, when we receive
            // `customer-updated` event having attached a Customer object
            // that did not have loaded the external_data or ecommerce_data
            for (const dataKey of [
                CUSTOMER_EXTERNAL_DATA_KEY,
                CUSTOMER_ECOMMERCE_DATA_KEY,
            ]) {
                if (customerData.get(dataKey)) continue

                const oldData = state.getIn(['customer', dataKey])
                if (oldData) {
                    customerData = customerData.set(dataKey, oldData)
                }
            }

            return state.set('customer', customerData)
        }

        case types.MERGE_CUSTOMER_EXTERNAL_DATA: {
            const { customerId, externalData } = action

            // if received customer data does not concern current customer of ticket, do nothing
            if (customerId !== state.getIn(['customer', 'id'])) {
                return state
            }

            let nextState = state
            for (const clientId in externalData) {
                nextState = nextState.setIn(
                    ['customer', CUSTOMER_EXTERNAL_DATA_KEY, clientId],
                    fromJS(externalData[clientId]),
                )
            }

            return nextState
        }

        case types.MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER: {
            const { customerId, store, shopper } = action
            if (!store || !shopper) {
                return state
            }

            // if received customer data does not concern current customer of ticket, do nothing
            if (customerId !== state.getIn(['customer', 'id'])) {
                return state
            }

            return state
                .setIn(
                    [
                        'customer',
                        CUSTOMER_ECOMMERCE_DATA_KEY,
                        store.uuid,
                        'store',
                    ],
                    fromJS(store),
                )
                .setIn(
                    [
                        'customer',
                        CUSTOMER_ECOMMERCE_DATA_KEY,
                        store.uuid,
                        'shopper',
                    ],
                    fromJS(shopper),
                )
        }

        case types.MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER_ADDRESS: {
            const { customerId, storeUUID, shopperAddress } = action
            if (!storeUUID || !shopperAddress) {
                return state
            }

            // if received customer data does not concern current customer of ticket, do nothing
            if (customerId !== state.getIn(['customer', 'id'])) {
                return state
            }

            const addressesPath = [
                'customer',
                CUSTOMER_ECOMMERCE_DATA_KEY,
                storeUUID,
                'addresses',
            ]
            let addresses: ShopperAddress[] = (
                state.getIn(addressesPath) as List<Map<any, any>> | undefined
            )?.toJS()
            if (!addresses) {
                return state.setIn(addressesPath, fromJS([shopperAddress]))
            }

            // replace the existing address
            const existingAddressIndex = addresses.findIndex(
                (address: ShopperAddress) => address.id === shopperAddress.id,
            )
            if (existingAddressIndex !== -1) {
                addresses[existingAddressIndex] = shopperAddress
                return state.setIn(addressesPath, fromJS(addresses))
            }

            // add the new address to the list
            // and keep the latest MAX_ADDRESSES_PER_SHOPPER addresses
            addresses.push(shopperAddress)
            addresses = addresses.sort((a, b) => {
                const aCreatedAt = new Date(a.created_datetime)
                const bCreatedAt = new Date(b.created_datetime)
                return bCreatedAt.getTime() - aCreatedAt.getTime()
            })
            while (addresses.length > types.MAX_ADDRESSES_PER_SHOPPER) {
                addresses.pop()
            }

            return state.setIn(addressesPath, fromJS(addresses))
        }

        case types.MERGE_CUSTOMER_ECOMMERCE_DATA_ORDER: {
            const { customerId, storeUUID, shopperOrder } = action
            if (!storeUUID || !shopperOrder) {
                return state
            }

            // if received customer data does not concern current customer of ticket, do nothing
            if (customerId !== state.getIn(['customer', 'id'])) {
                return state
            }

            const ordersPath = [
                'customer',
                CUSTOMER_ECOMMERCE_DATA_KEY,
                storeUUID,
                'orders',
            ]
            let orders: ShopperOrder[] = (
                state.getIn(ordersPath) as List<Map<any, any>> | undefined
            )?.toJS()
            if (!orders) {
                return state.setIn(ordersPath, fromJS([shopperOrder]))
            }

            // replace the existing order
            const existingOrderIndex = orders.findIndex(
                (order: ShopperOrder) => order.id === shopperOrder.id,
            )
            if (existingOrderIndex !== -1) {
                orders[existingOrderIndex] = shopperOrder
                return state.setIn(ordersPath, fromJS(orders))
            }

            // add the new order to the list
            // and keep the latest MAX_ORDERS_PER_SHOPPER orders
            orders.push(shopperOrder)
            orders = orders.sort((a, b) => {
                const aCreatedAt = new Date(a.created_datetime)
                const bCreatedAt = new Date(b.created_datetime)
                return bCreatedAt.getTime() - aCreatedAt.getTime()
            })
            while (orders.length > types.MAX_ORDERS_PER_SHOPPER) {
                orders.pop()
            }

            return state.setIn(ordersPath, fromJS(orders))
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
                        },
                    )

                    if (~messageIndex) {
                        return messages.splice(messageIndex, 1)
                    }

                    return messages
                },
            )
        }

        case types.DISPLAY_TICKET_AUDIT_LOG_EVENTS:
            return state.setIn(
                ['_internal', 'shouldDisplayAuditLogEvents'],
                true,
            )

        case types.HIDE_TICKET_AUDIT_LOG_EVENTS:
            return state.setIn(
                ['_internal', 'shouldDisplayAuditLogEvents'],
                false,
            )

        case types.ADD_TICKET_AUDIT_LOG_EVENTS:
            return state.updateIn(['events'], (events: List<any>) => {
                let results = events
                ;(action.payload as List<any>)
                    .filter(
                        (eventToDisplay: Map<any, any>) =>
                            !Object.values(PhoneIntegrationEvent).includes(
                                eventToDisplay.get('type'),
                            ),
                    )
                    .forEach((eventToDisplay: Map<any, any>) => {
                        const index = results.findIndex(
                            (event: Map<any, any>) =>
                                event.get('id') === eventToDisplay.get('id'),
                        )

                        if (index === -1) {
                            results = results.push(eventToDisplay)
                        } else {
                            results = results.set(index, eventToDisplay)
                        }
                    })
                return shouldDeduplicateAuditLogEvents(
                    state.get('created_datetime'),
                )
                    ? deduplicateAuditLogEvents(results)
                    : results
            })

        case types.REMOVE_TICKET_AUDIT_LOG_EVENTS:
            return state.updateIn(['events'], (events: List<any>) =>
                events.filter(
                    (event: Map<any, any>) =>
                        ![
                            ...Object.values(TICKET_EVENT_TYPES),
                            ...Object.values(
                                SATISFACTION_SURVEY_DETAIL_EVENT_TYPES,
                            ),
                        ].includes(event.get('type')),
                ),
            )

        case types.TICKET_MESSAGE_DELETED:
            return state.updateIn(
                ['_internal', 'pendingMessages'],
                (messages: List<any>) => {
                    const index = messages.findIndex(
                        (message: Map<any, any>) =>
                            message.getIn(['_internal', 'id']) ===
                            parseInt(action.payload as string),
                    )

                    if (!~index) {
                        return messages
                    }
                    return messages.delete(index)
                },
            )

        case types.SEND_INTENT_FEEDBACK_SUCCESS:
            return state.update('messages', (messages: List<any>) =>
                messages.map((message: Map<any, any>) => {
                    const { messageId, intents } = action.payload as {
                        messageId: number
                        intents: any
                    }
                    return message.get('id') === messageId
                        ? message.set('intents', fromJS(intents))
                        : message
                }),
            )

        case types.SET_TYPING_ACTIVITY_SHOPPER: {
            const { isShopperTyping, isShopperTypingTimeoutId = undefined } =
                action.payload as {
                    isShopperTyping: boolean
                    isShopperTypingTimeoutId?: number
                }

            return state
                .setIn(['_internal', 'isShopperTyping'], isShopperTyping)
                .setIn(
                    ['_internal', 'isShopperTypingTimeoutId'],
                    isShopperTypingTimeoutId,
                )
        }

        case types.TICKET_PARTIAL_UPDATE_START: {
            return state.setIn(['_internal', 'isPartialUpdating'], true)
        }

        case types.TICKET_PARTIAL_UPDATE_SUCCESS:
        case types.TICKET_PARTIAL_UPDATE_ERROR: {
            return state.setIn(['_internal', 'isPartialUpdating'], false)
        }

        case types.SET_IN_TICKET_SUGGESTION_STATE: {
            const inTicketSuggestionState = action.inTicketSuggestionState
            return state.setIn(
                ['state', 'inTicketSuggestionState'],
                inTicketSuggestionState,
            )
        }

        case types.UPDATE_CUSTOM_FIELD_STATE: {
            const { id } = action.payload as CustomFieldState
            return state.setIn(
                ['custom_fields', String(id)],
                fromJS(action.payload),
            )
        }

        case types.UPDATE_CUSTOM_FIELD_VALUE: {
            const { id, value } = action.payload as {
                id: CustomFieldState['id']
                value: CustomFieldState['value']
            }
            return state.mergeIn(
                ['custom_fields', String(id)],
                fromJS({
                    id,
                    value,
                }),
            )
        }

        case types.UPDATE_CUSTOM_FIELD_PREDICTION: {
            const { id, prediction } = action.payload as {
                id: CustomFieldState['id']
                prediction: CustomFieldState['prediction']
            }
            return state.mergeIn(
                ['custom_fields', String(id)],
                fromJS({ id, prediction }),
            )
        }

        case types.UPDATE_CUSTOM_FIELD_ERROR: {
            const { id, hasError } = action.payload as {
                id: CustomFieldState['id']
                hasError: CustomFieldState['hasError']
            }
            return state.mergeIn(
                ['custom_fields', String(id)],
                fromJS({ id, hasError }),
            )
        }

        case types.SET_INVALID_CUSTOM_FIELDS_TO_ERRORED: {
            const erroredCustomFields =
                action.payload as CustomFieldState['id'][]
            let nextState = state
            erroredCustomFields.forEach((erroredId) => {
                nextState = nextState.mergeIn(
                    ['custom_fields', String(erroredId)],
                    fromJS({ id: erroredId, hasError: true }),
                )
            })
            return nextState
        }

        case types.RESTORE_TICKET_DRAFT: {
            const {
                assignee_team,
                assignee_user,
                custom_fields,
                customer,
                subject,
                tags,
            } = action.payload as Pick<
                Ticket,
                | 'assignee_team'
                | 'assignee_user'
                | 'customer'
                | 'subject'
                | 'tags'
                | 'custom_fields'
            >
            return state
                .set('assignee_team', fromJS(assignee_team))
                .set('assignee_user', fromJS(assignee_user))
                .set('custom_fields', fromJS(custom_fields ?? {}))
                .set('customer', fromJS(customer) || null)
                .set('subject', subject)
                .set('tags', fromJS(tags))
        }

        case types.RESTORE_TICKET_DRAFT_APPLY_MACRO: {
            return state.setIn(
                ['state', 'appliedMacro'],
                fromJS(action.payload),
            )
        }

        case types.SET_HAS_ATTEMPTED_TO_CLOSE_TICKET: {
            return state.setIn(
                ['state', 'hasAttemptedToCloseTicket'],
                action.payload,
            )
        }

        default:
            return state
    }
}
