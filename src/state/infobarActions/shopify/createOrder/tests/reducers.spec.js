import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {
    shopifyCalculatedDraftOrderFixture,
    shopifyDraftOrderPayloadFixture,
} from '../../../../../fixtures/shopify.ts'
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

    describe('SET_CALCULATED_DRAFT_ORDER', () => {
        it('should set calculated draft order', () => {
            const calculatedDraftOrder = fromJS(
                shopifyCalculatedDraftOrderFixture()
            )
            const action = {
                type: constants.SET_CALCULATED_DRAFT_ORDER,
                calculatedDraftOrder,
            }
            const nextState = reducer(initialState, action)
            expect(nextState.get('calculatedDraftOrder')).toEqualImmutable(
                calculatedDraftOrder
            )
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
