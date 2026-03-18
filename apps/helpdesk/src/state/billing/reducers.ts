import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import type { GorgiasAction } from '../types'
import * as constants from './constants'
import type { BillingImmutableState } from './types'

export const initialState: BillingImmutableState = fromJS({})

export default function reducer(
    state: BillingImmutableState = initialState,
    action: GorgiasAction,
): BillingImmutableState {
    switch (action.type) {
        case constants.UPDATE_INVOICE_IN_LIST:
            return state.update('invoices', (invoices: List<any>) => {
                return invoices.map((invoice: Map<any, any>) => {
                    if (invoice.get('id') === action.invoice?.get('id')) {
                        return action.invoice
                    }
                    return invoice
                })
            })
        case constants.FETCH_INVOICES_SUCCESS:
            return state.set('invoices', fromJS(action.resp))
        case constants.FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS:
            return state.set('currentProductsUsage', fromJS(action.resp))
        default:
            return state
    }
}
