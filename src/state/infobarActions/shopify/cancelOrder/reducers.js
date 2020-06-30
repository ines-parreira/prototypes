// @flow

import {fromJS} from 'immutable'

import type {actionType} from '../../../types'

import type {CancelOrderState} from './types'
import {
    SET_INITIAL_STATE,
    SET_LINE_ITEMS,
    SET_LOADING,
    SET_ORDER_ID,
    SET_PAYLOAD,
    SET_REFUND,
    SET_REFUND_AMOUNT,
    SET_RESTOCK,
} from './constants'

export const initialState: CancelOrderState = fromJS({
    loading: false,
    loadingMessage: null,
    orderId: null,
    payload: null,
    lineItems: null,
    refund: {},
})

export default function reducer(
    state: CancelOrderState = initialState,
    action: actionType
): CancelOrderState {
    switch (action.type) {
        case SET_LOADING:
            return state
                .set('loading', action.loading)
                .set('loadingMessage', action.message)
        case SET_ORDER_ID:
            return state.set('orderId', action.orderId)
        case SET_PAYLOAD:
            return state.set('payload', action.payload)
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
