// @flow
import {fromJS} from 'immutable'
import * as constants from './constants'

export const initialState = fromJS({})

import type {Map} from 'immutable'
import type {actionType} from '../types'

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    switch (action.type) {
        case constants.FETCH_INVOICES_SUCCESS:
            return state.set('invoices', fromJS(action.resp))
        case constants.FETCH_CREDIT_CARD_SUCCESS:
        case constants.UPDATE_CREDIT_CARD_SUCCESS:
            return state.set('creditCard', fromJS(action.resp))
        case constants.FETCH_CURRENT_USAGE_SUCCESS:
            return state.set('currentUsage', fromJS(action.resp))
        case constants.UPDATE_SUBSCRIPTION_SUCCESS:
            return state.set('currentPlanId', action.resp.data.plan)
        default:
            return state
    }
}
