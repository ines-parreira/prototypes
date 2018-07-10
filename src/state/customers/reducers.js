// @flow
import {fromJS} from 'immutable'
import * as constants from './constants'
import * as ticketConstants from '../ticket/constants'
import * as viewsConstants from '../views/constants'

import type {Map} from 'immutable'
import type {actionType} from '../types'

export const initialState = fromJS({
    active: {},
    items: [],
    customerHistory: {
        triedLoading: false,
        hasHistory: false,
        tickets: [],
        events: []
    },
    _internal: {
        loading: {
            history: false,
            active: false,
            merge: false
        }
    }
})

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    const items = state.get('items', fromJS([]))

    switch (action.type) {
        case viewsConstants.FETCH_LIST_VIEW_SUCCESS: {
            if (action.viewType !== 'customer-list') {
                return state
            }

            const payload = action.data

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
            const customer = fromJS(action.resp)

            if (action.isUpdate) {
                const customerId = customer.get('id')

                // if updated customer is in current items list, update it
                newState = newState.set('items',
                    items.set(items.findIndex(item => item.get('id') === customerId), customer)
                )

                // if updated customer is the active one, update the active one
                if (customerId === state.getIn(['active', 'id'])) {
                    newState = newState.set('active', customer)
                }
            }

            return newState
        }

        case constants.DELETE_CUSTOMER_SUCCESS: {
            return state
                .merge({
                    items: state.get('items').filter(item => item.get('id') !== action.customerId),
                })
        }

        case constants.FETCH_CUSTOMER_HISTORY_START: {
            return state
                .setIn(['customerHistory', 'triedLoading'], true)
                .setIn(['_internal', 'loading', 'history'], true)
        }

        case constants.FETCH_CUSTOMER_HISTORY_SUCCESS: {
            const hasHistory = action.resp.meta.item_count > 1

            return state
                .setIn(['customerHistory', 'tickets'], fromJS(action.resp.data))
                .setIn(['_internal', 'loading', 'history'], false)
                .setIn(['customerHistory', 'hasHistory'], hasHistory)
        }

        case ticketConstants.CLEAR_TICKET:
        case constants.FETCH_CUSTOMER_HISTORY_ERROR: {
            let newState = state
                .setIn(['_internal', 'loading', 'history'], false)

            if (!action.shouldDisplayHistoryOnNextPage) {
                newState = newState
                    .setIn(['customerHistory', 'tickets'], fromJS({}))
                    .setIn(['customerHistory', 'hasHistory'], false)
            }

            return newState
        }

        case constants.CLEAR_CUSTOMER: {
            return state.set('active', fromJS({}))
        }

        case viewsConstants.BULK_DELETE_SUCCESS: {
            if (action.viewType !== 'customer-list') {
                return state
            }

            const newItems = state
                .get('items', fromJS([]))
                .filter(item => !action.ids.includes(item.get('id')))

            return state.set('items', newItems)
        }

        case constants.MERGE_CUSTOMERS_START: {
            return state.setIn(['_internal', 'loading', 'merge'], true)
        }

        case constants.MERGE_CUSTOMERS_ERROR:
        case constants.MERGE_CUSTOMERS_SUCCESS: {
            let newState = state.setIn(['_internal', 'loading', 'merge'], false)

            if (action.resp && state.getIn(['active', 'id']) === action.resp.id) {
                newState = newState.set('active', fromJS(action.resp))
            }

            return newState
        }

        default:
            return state
    }
}
