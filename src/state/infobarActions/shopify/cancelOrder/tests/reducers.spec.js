import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {
    shopifyCancelOrderPayloadFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture,
    shopifySuggestedRefundFixture
} from '../../../../../fixtures/shopify'
import {initRefundOrderLineItems} from '../../../../../business/shopify/order'
import reducer, {initialState} from '../reducers'
import * as constants from '../constants'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.cancelOrder reducer', () => {
    describe('SET_LOADING', () => {
        it('should set loading state', () => {
            const action = {type: constants.SET_LOADING, loading: true, message: null}
            const nextState = reducer(initialState, action)
            expect(nextState.get('loading')).toBe(true)
        })

        it('should set loading state with given loading message', () => {
            const action = {type: constants.SET_LOADING, loading: true, message: 'foo'}
            const nextState = reducer(initialState, action)
            expect(nextState.get('loading')).toBe(true)
            expect(nextState.get('loadingMessage')).toBe('foo')
        })
    })

    describe('SET_ORDER_ID', () => {
        it('should set order id', () => {
            const orderId = 123
            const action = {type: constants.SET_ORDER_ID, orderId}
            const nextState = reducer(initialState, action)
            expect(nextState.get('orderId')).toEqualImmutable(orderId)
        })
    })

    describe('SET_PAYLOAD', () => {
        it('should set payload', () => {
            const payload = fromJS(shopifyCancelOrderPayloadFixture())
            const action = {type: constants.SET_PAYLOAD, payload}
            const nextState = reducer(initialState, action)
            expect(nextState.get('payload')).toEqualImmutable(payload)
        })
    })

    describe('SET_LINE_ITEMS', () => {
        it('should set line items', () => {
            const order = fromJS(shopifyOrderFixture())
            const lineItems = initRefundOrderLineItems(order)
            const action = {type: constants.SET_LINE_ITEMS, lineItems}
            const nextState = reducer(initialState, action)
            expect(nextState.get('lineItems')).toEqualImmutable(lineItems)
        })
    })

    describe('SET_REFUND', () => {
        it('should set refund', () => {
            const refund = fromJS(shopifySuggestedRefundFixture())
            const action = {type: constants.SET_REFUND, refund}
            const nextState = reducer(initialState, action)
            expect(nextState.get('refund')).toEqualImmutable(refund)
        })
    })

    describe('SET_REFUND_AMOUNT', () => {
        it('should set products', () => {
            const amount = '9.99'
            const payload = fromJS(shopifyCancelOrderPayloadFixture())
            const state = initialState.set('payload', payload)
            const action = {type: constants.SET_REFUND_AMOUNT, amount}
            const nextState = reducer(state, action)
            expect(nextState.getIn(['payload', 'refund', 'transactions', 0, 'amount'])).toEqual(amount)
        })
    })

    describe('SET_INITIAL_STATE', () => {
        it('should set initial state', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const previousState = initialState.set('payload', payload)
            const action = {type: constants.SET_INITIAL_STATE}
            const nextState = reducer(previousState, action)
            expect(nextState).toEqualImmutable(initialState)
        })
    })
})
