// @flow
import {Map, fromJS} from 'immutable'

export const initialState = fromJS({})

import type {actionType} from '../types'

import * as constants from './constants'

export default function reducer(
    state: Map<*, *> = initialState,
    action: actionType
): Map<*, *> {
    switch (action.type) {
        case constants.SET_FUTURE_SUBSCRIPTION_PLAN:
            return state.set('futureSubscriptionPlan', action.planId)
        case constants.UPDATE_INVOICE_IN_LIST:
            return state.update('invoices', (invoices) => {
                return invoices.map((invoice) => {
                    if (invoice.get('id') === action.invoice.get('id')) {
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
