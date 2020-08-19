import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {
    shopifyDraftOrderFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyShippingLineFixture,
} from '../../../../../fixtures/shopify'
import reducer, {initialState} from '../reducers.ts'
import * as constants from '../constants.ts'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.createOrder reducer', () => {
    describe('SET_LOADING', () => {
        it('should set loading state', () => {
            const action = {
                type: constants.SET_LOADING,
                loading: true,
                message: null,
            }
            const nextState = reducer(initialState, action)
            expect(nextState.get('loading')).toBe(true)
        })

        it('should set loading state with given loading message', () => {
            const action = {
                type: constants.SET_LOADING,
                loading: true,
                message: 'foo',
            }
            const nextState = reducer(initialState, action)
            expect(nextState.get('loading')).toBe(true)
            expect(nextState.get('loadingMessage')).toBe('foo')
        })
    })

    describe('SET_PAYLOAD', () => {
        it('should set payload', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const action = {type: constants.SET_PAYLOAD, payload}
            const nextState = reducer(initialState, action)
            expect(nextState.get('payload')).toEqualImmutable(payload)
        })
    })

    describe('SET_DRAFT_ORDER', () => {
        it('should set draft order', () => {
            const draftOrder = fromJS(shopifyDraftOrderFixture())
            const action = {type: constants.SET_DRAFT_ORDER, draftOrder}
            const nextState = reducer(initialState, action)
            expect(nextState.get('draftOrder')).toEqualImmutable(draftOrder)
        })
    })

    describe('SET_PRODUCTS', () => {
        it('should set products', () => {
            const products = new Map([
                [1, {id: 1}],
                [2, {id: 2}],
            ])
            const action = {type: constants.SET_PRODUCTS, products}
            const nextState = reducer(initialState, action)
            expect(nextState.get('products')).toEqual(products)
        })
    })

    describe('SET_DEFAULT_SHIPPING_LINE', () => {
        it('should set default shipping line', () => {
            const defaultShippingLine = fromJS(shopifyShippingLineFixture())
            const action = {
                type: constants.SET_DEFAULT_SHIPPING_LINE,
                defaultShippingLine,
            }
            const nextState = reducer(initialState, action)
            expect(nextState.get('defaultShippingLine')).toEqualImmutable(
                defaultShippingLine
            )
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
