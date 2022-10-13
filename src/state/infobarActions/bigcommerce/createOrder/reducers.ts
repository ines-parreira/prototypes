import {GorgiasAction} from 'state/types'
import {CreateOrderState} from './types'
import {SET_CART_ID, RESET_CART} from './constants'

export const initialState: CreateOrderState = {
    cartId: null,
}

export default function reducer(
    state: CreateOrderState = initialState,
    action: GorgiasAction
): CreateOrderState {
    switch (action.type) {
        case SET_CART_ID:
            return {
                ...state,
                cartId: action.cartId,
            }
        case RESET_CART:
            return {
                ...initialState,
            }
        default:
            return state
    }
}
