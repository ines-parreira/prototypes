import {Map, fromJS, List} from 'immutable'

import {GorgiasAction} from '../types'

import * as constants from './constants'
import {BillingImmutableState} from './types'

export const initialState: BillingImmutableState = fromJS({})

export default function reducer(
    state: BillingImmutableState = initialState,
    action: GorgiasAction
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
        case constants.SET_CREDIT_CARD:
            return state.set('creditCard', action.creditCard)
        case constants.FETCH_CREDIT_CARD_SUCCESS:
        case constants.UPDATE_CREDIT_CARD_SUCCESS:
            return state.set('creditCard', fromJS(action.resp))
        case constants.FETCH_CURRENT_USAGE_SUCCESS:
            return state.set('currentUsage', fromJS(action.resp))
        case constants.UPDATE_BILLING_CONTACT_SUCCESS:
        case constants.FETCH_BILLING_CONTACT_SUCCESS:
            return state.set('contact', fromJS(action.billingContact))
        default:
            return state
    }
}
