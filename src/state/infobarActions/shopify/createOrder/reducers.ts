import {fromJS} from 'immutable'

import {GorgiasAction} from '../../../types'

import {CreateOrderState} from './types'
import {
    SET_DEFAULT_SHIPPING_LINE,
    SET_DRAFT_ORDER,
    SET_INITIAL_STATE,
    SET_LOADING,
    SET_PAYLOAD,
    SET_PRODUCTS,
} from './constants'

export const initialState: CreateOrderState = fromJS({
    loading: false,
    loadingMessage: null,
    payload: null,
    draftOrder: null,
    products: new Map(),
    defaultShippingLine: null,
})

export default function reducer(
    state: CreateOrderState = initialState,
    action: GorgiasAction
): CreateOrderState {
    switch (action.type) {
        case SET_LOADING:
            return state
                .set('loading', action.loading)
                .set('loadingMessage', action.message)
        case SET_PAYLOAD:
            return state.set('payload', action.payload)
        case SET_DRAFT_ORDER:
            return state.set('draftOrder', action.draftOrder)
        case SET_PRODUCTS:
            return state.set('products', action.products)
        case SET_DEFAULT_SHIPPING_LINE:
            return state.set('defaultShippingLine', action.defaultShippingLine)
        case SET_INITIAL_STATE:
            return initialState
        default:
            return state
    }
}
