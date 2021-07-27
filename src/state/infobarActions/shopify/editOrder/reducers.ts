import {fromJS} from 'immutable'

import {GorgiasAction} from '../../../types'

import {EditOrderState} from './types'
import {
    SET_INITIAL_STATE,
    SET_LINE_ITEMS,
    SET_LOADING,
    SET_ORDER_ID,
    SET_PAYLOAD,
    SET_REFUND,
    SET_REFUND_AMOUNT,
    SET_RESTOCK,
    SET_PRODUCTS,
    SET_CALCULATED_EDIT_ORDER,
    SET_CALCULATED_ORDER_ID,
} from './constants'

export const initialState: EditOrderState = fromJS({
    loading: false,
    loadingMessage: null,
    orderId: null,
    payload: null,
    lineItems: null,
    refund: {},
    products: new Map(),
    calculatedEditOrder: new Map(),
})

export default function reducer(
    state: EditOrderState = initialState,
    action: GorgiasAction
): EditOrderState {
    switch (action.type) {
        case SET_LOADING:
            return state
                .set('loading', action.loading)
                .set('loadingMessage', action.message)
        case SET_ORDER_ID:
            return state.set('orderId', action.orderId)
        case SET_PRODUCTS:
            return state.set('products', action.products)
        case SET_PAYLOAD:
            return state.set('payload', action.payload)
        case SET_CALCULATED_EDIT_ORDER:
            return state.set('calculatedEditOrder', action.calculatedEditOrder)
        case SET_CALCULATED_ORDER_ID:
            return state.get('calculatedEditOrder')
                ? state.setIn(
                      ['calculatedEditOrder', 'calculatedOrderId'],
                      action.calculatedOrderId
                  )
                : state
        case SET_LINE_ITEMS:
            return state.set('lineItems', action.lineItems)
        case SET_REFUND:
            return state.set('refund', action.refund)
        case SET_REFUND_AMOUNT:
            return state.get('payload')
                ? state.setIn(
                      ['payload', 'refund', 'transactions', 0, 'amount'],
                      action.amount
                  )
                : state
        case SET_RESTOCK:
            return state.get('payload')
                ? state.setIn(['payload', 'refund', 'restock'], action.restock)
                : state
        case SET_INITIAL_STATE:
            return initialState
        default:
            return state
    }
}
