import {fromJS} from 'immutable'
import * as types from './constants'

export const initialState = fromJS({})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_INVOICES_SUCCESS:
            return state.set('invoices', fromJS(action.resp))
        case types.FETCH_CREDIT_CARD_SUCCESS:
        case types.UPDATE_CREDIT_CARD_SUCCESS:
            return state.set('creditCard', fromJS(action.resp))
        case types.FETCH_CURRENT_USAGE_SUCCESS:
            return state.set('currentUsage', fromJS(action.resp))
        case types.UPDATE_SUBSCRIPTION_SUCCESS:
            return state.set('currentPlanId', action.resp.data.plan)
        default:
            return state
    }
}
