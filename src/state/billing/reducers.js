import {fromJS} from 'immutable'
import * as types from './constants'

export const initialState = fromJS({
    _internal: {
        loading: {}
    }
})

export default (state = initialState, action) => {
    const loadingPath = ['_internal', 'loading']

    switch (action.type) {
        case types.FETCH_INVOICES_START:
            return state.setIn([...loadingPath, 'fetchInvoices'], true)
        case types.FETCH_INVOICES_ERROR:
            return state.setIn([...loadingPath, 'fetchInvoices'], false)
        case types.FETCH_INVOICES_SUCCESS:
            return state
                .setIn([...loadingPath, 'fetchInvoices'], false)
                .set('invoices', fromJS(action.resp))

        case types.FETCH_CREDIT_CARD_START:
            return state.setIn([...loadingPath, 'fetchCreditCard'], true)
        case types.FETCH_CREDIT_CARD_ERROR:
            return state.setIn([...loadingPath, 'fetchCreditCard'], false)
        case types.FETCH_CREDIT_CARD_SUCCESS:
            return state
                .setIn([...loadingPath, 'fetchCreditCard'], false)
                .set('creditCard', fromJS(action.resp))

        case types.UPDATE_CREDIT_CARD_START:
            return state.setIn([...loadingPath, 'updateCreditCard'], true)
        case types.UPDATE_CREDIT_CARD_ERROR:
            return state.setIn([...loadingPath, 'updateCreditCard'], false)
        case types.UPDATE_CREDIT_CARD_SUCCESS:
            return state
                .setIn([...loadingPath, 'updateCreditCard'], false)
                .set('creditCard', fromJS(action.resp))

        case types.FETCH_CURRENT_USAGE_START:
            return state.setIn([...loadingPath, 'fetchCurrentUsage'], true)
        case types.FETCH_CURRENT_USAGE_ERROR:
            return state.setIn([...loadingPath, 'fetchCurrentUsage'], false)
        case types.FETCH_CURRENT_USAGE_SUCCESS:
            return state
                .setIn([...loadingPath, 'fetchCurrentUsage'], false)
                .set('currentUsage', fromJS(action.resp))
        default:
            return state
    }
}
