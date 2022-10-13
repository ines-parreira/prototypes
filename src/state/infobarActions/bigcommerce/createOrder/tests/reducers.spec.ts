import * as immutableMatchers from 'jest-immutable-matchers'

import reducer, {
    initialState,
} from 'state/infobarActions/bigcommerce/createOrder/reducers'
import * as constants from 'state/infobarActions/bigcommerce/createOrder/constants'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.createOrder reducer', () => {
    describe('SET_CART_ID', () => {
        it('should set payload', () => {
            const cartId = 'eed98ad3-8f2a-4558-864a-3a9e04d2cb61'
            const action = {type: constants.SET_CART_ID, cartId}
            const nextState = reducer(initialState, action)
            expect(nextState.cartId).toEqualImmutable(cartId)
        })
    })

    describe('RESET_CART', () => {
        it('should set initial state', () => {
            const cartId = 'eed98ad3-8f2a-4558-864a-3a9e04d2cb61'
            const previousState = initialState
            previousState.cartId = cartId
            const action = {type: constants.RESET_CART}
            const nextState = reducer(previousState, action)
            expect(nextState).toEqual(initialState)
        })
    })
})
