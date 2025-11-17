import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import { ViewType } from 'models/view/types'
import * as constants from 'state/customers/constants'
import type { CustomersState } from 'state/customers/types'
import type { GorgiasAction } from 'state/types'
import * as viewsConstants from 'state/views/constants'

export const initialState: CustomersState = fromJS({
    active: {},
    items: [],
    _internal: {
        loading: {
            active: false,
            merge: false,
        },
    },
})

export default function reducer(
    state: CustomersState = initialState,
    action: GorgiasAction,
): CustomersState {
    const items = state.get('items', fromJS([])) as List<any>

    switch (action.type) {
        case viewsConstants.FETCH_LIST_VIEW_SUCCESS: {
            if (action.viewType !== ViewType.CustomerList) {
                return state
            }

            return state.set('items', fromJS(action.fetched?.data))
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
                                item.get('id') === customerId,
                        ),
                        customer,
                    ),
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
                        item.get('id') !== action.customerId,
                ),
            })
        }

        case constants.BULK_DELETE_SUCCESS: {
            if (action.viewType !== ViewType.CustomerList) {
                return state
            }

            const newItems = (
                state.get('items', fromJS([])) as List<any>
            ).filter(
                (item: Map<any, any>) =>
                    !!action.ids && !action.ids.includes(item.get('id')),
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
                    (action.resp as { id: number }).id
            ) {
                newState = newState.set('active', fromJS(action.resp))
            }

            return newState
        }

        default:
            return state
    }
}
