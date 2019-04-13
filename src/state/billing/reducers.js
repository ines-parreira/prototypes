// @flow
import {Map, fromJS} from 'immutable'

export const initialState = fromJS({})

import type {actionType} from '../types'

import * as constants from './constants'

export default function reducer(state: Map<*,*> = initialState, action: actionType): Map<*,*> {
    switch (action.type) {
        case constants.FETCH_INVOICES_SUCCESS:
            return state.set('invoices', fromJS(action.resp))
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
