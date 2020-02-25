import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {
    shopifyDraftOrderFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyShippingLineFixture
} from '../../../../../fixtures/shopify'
import reducer, {initialState} from '../reducers'
import * as constants from '../constants'

jest.addMatchers(immutableMatchers)

describe('infobarActions.shopify.duplicateOrder reducer', () => {
    describe('SET_LOADING', () => {
        it('should set loading state', () => {
            const action = {type: constants.SET_LOADING, loading: true}
            const nextState = reducer(initialState, action)
            expect(nextState.get('loading')).toBe(true)
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
            const products = new Map([[1, {id: 1}], [2, {id: 2}]])
            const action = {type: constants.SET_PRODUCTS, products}
            const nextState = reducer(initialState, action)
            expect(nextState.get('products')).toEqual(products)
        })
    })

    describe('SET_DEFAULT_SHIPPING_LINE', () => {
        it('should set default shipping line', () => {
            const defaultShippingLine = fromJS(shopifyShippingLineFixture())
            const action = {type: constants.SET_DEFAULT_SHIPPING_LINE, defaultShippingLine}
            const nextState = reducer(initialState, action)
            expect(nextState.get('defaultShippingLine')).toEqualImmutable(defaultShippingLine)
        })
    })
})
