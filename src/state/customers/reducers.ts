import {fromJS, Map, List} from 'immutable'
import _sortBy from 'lodash/sortBy'

import {Ticket, TicketElement} from '../../models/ticket/types'
import * as newMessageConstants from '../newMessage/constants'
import * as ticketConstants from '../ticket/constants'
import * as viewsConstants from '../views/constants.js'

import {GorgiasAction} from '../types'

import * as constants from './constants.js'
import {CustomersState} from './types'

export const initialState: CustomersState = fromJS({
    active: {},
    items: [],
    customerHistory: {
        triedLoading: false,
        hasHistory: false,
        tickets: [],
        events: [],
    },
    _internal: {
        loading: {
            history: false,
            active: false,
            merge: false,
        },
    },
})

export default function reducer(
    state: CustomersState = initialState,
    action: GorgiasAction
): CustomersState {
    const items = state.get('items', fromJS([])) as List<any>

    switch (action.type) {
        case viewsConstants.FETCH_LIST_VIEW_SUCCESS: {
            if (action.viewType !== 'customer-list') {
                return state
            }

            const payload = action.data as {data: unknown}

            return state.set('items', fromJS(payload.data))
        }

        case constants.FETCH_CUSTOMER_START: {
            return state
                .set('active', fromJS({}))
                .setIn(['_internal', 'loading', 'active'], true)
        }

        case constants.FETCH_CUSTOMER_SUCCESS: {
            return state
                .set('active', fromJS(action.resp))
                .setIn(['_internal', 'loading', 'active'], false)
        }

        case constants.FETCH_CUSTOMER_ERROR: {
            return state.setIn(['_internal', 'loading', 'active'], false)
        }

        case constants.SUBMIT_CUSTOMER_SUCCESS: {
            let newState = state
            const customer = fromJS(action.resp) as Map<any, any>

            if (action.isUpdate) {
                const customerId = customer.get('id') as number

                // if updated customer is in current items list, update it
                newState = newState.set(
                    'items',
                    items.set(
                        items.findIndex(
                            (item: Map<any, any>) =>
                                item.get('id') === customerId
                        ),
                        customer
                    )
                )

                // if updated customer is the active one, update the active one
                if (customerId === state.getIn(['active', 'id'])) {
                    newState = newState.set('active', customer)
                }
            }

            return newState
        }

        case constants.DELETE_CUSTOMER_SUCCESS: {
            return state.merge({
                items: (state.get('items') as List<any>).filter(
                    (item: Map<any, any>) =>
                        item.get('id') !== action.customerId
                ),
            })
        }

        case constants.FETCH_CUSTOMER_HISTORY_START: {
            return state
                .setIn(['customerHistory', 'triedLoading'], true)
                .setIn(['_internal', 'loading', 'history'], true)
        }

        case constants.FETCH_CUSTOMER_HISTORY_SUCCESS: {
            const resp = action.resp as {
                meta: {item_count: number}
                data: unknown[]
            }
            const hasHistory = resp.meta.item_count > 1
            const tickets: unknown[] = resp.data
            const sortedTickets = _sortBy(tickets, ['created_datetime'])

            return state
                .setIn(['customerHistory', 'tickets'], fromJS(sortedTickets))
                .setIn(['_internal', 'loading', 'history'], false)
                .setIn(['customerHistory', 'hasHistory'], hasHistory)
        }

        case ticketConstants.CLEAR_TICKET: {
            let newState = state
                .setIn(['_internal', 'loading', 'history'], false)
                .setIn(['customerHistory', 'triedLoading'], false)

            if (!action.shouldDisplayHistoryOnNextPage) {
                newState = newState
                    .setIn(['customerHistory', 'tickets'], fromJS([]))
                    .setIn(['customerHistory', 'hasHistory'], false)
            }

            return newState
        }

        case newMessageConstants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_SUCCESS: {
            const updated = action.resp as TicketElement
            const ticketIndex = (state.getIn(
                ['customerHistory', 'tickets'],
                fromJS([])
            ) as List<any>).findIndex(
                (ticket: Map<any, any>) =>
                    ticket.get('id') === updated.ticket_id
            )
            if (~ticketIndex) {
                return state.updateIn(
                    ['customerHistory', 'tickets', ticketIndex],
                    (ticket: Map<any, any>) =>
                        ticket
                            .set(
                                'messages_count',
                                (ticket.get('messages_count', 0) as number) + 1
                            )
                            .set('excerpt', updated.body_text)
                )
            }
            return state
        }

        case ticketConstants.TICKET_PARTIAL_UPDATE_SUCCESS: {
            const updated = action.resp as Ticket
            const ticketIndex = (state.getIn(
                ['customerHistory', 'tickets'],
                fromJS([])
            ) as List<any>).findIndex(
                (ticket: Map<any, any>) => ticket.get('id') === updated.id
            )
            if (~ticketIndex) {
                return state.updateIn(
                    ['customerHistory', 'tickets', ticketIndex],
                    (ticket: Map<any, any>) =>
                        ticket
                            .set('assignee_user', fromJS(updated.assignee_user))
                            .set('status', updated.status)
                            .set('subject', updated.subject)
                )
            }
            return state
        }

        case constants.FETCH_CUSTOMER_HISTORY_ERROR: {
            let newState = state.setIn(
                ['_internal', 'loading', 'history'],
                false
            )

            if (!action.shouldDisplayHistoryOnNextPage) {
                newState = newState
                    .setIn(['customerHistory', 'tickets'], fromJS({}))
                    .setIn(['customerHistory', 'hasHistory'], false)
            }

            return newState
        }

        case constants.BULK_DELETE_SUCCESS: {
            if (action.viewType !== 'customer-list') {
                return state
            }

            const newItems = (state.get('items', fromJS([])) as List<
                any
            >).filter(
                (item: Map<any, any>) =>
                    !!action.ids && !action.ids.includes(item.get('id'))
            )

            return state.set('items', newItems)
        }

        case constants.MERGE_CUSTOMERS_START: {
            return state.setIn(['_internal', 'loading', 'merge'], true)
        }

        case constants.MERGE_CUSTOMERS_ERROR:
        case constants.MERGE_CUSTOMERS_SUCCESS: {
            let newState = state.setIn(['_internal', 'loading', 'merge'], false)

            if (
                action.resp &&
                state.getIn(['active', 'id']) ===
                    (action.resp as {id: number}).id
            ) {
                newState = newState.set('active', fromJS(action.resp))
            }

            return newState
        }

        default:
            return state
    }
}
