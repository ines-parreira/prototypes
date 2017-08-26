import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import * as currentAccountFixtures from '../../../fixtures/currentAccount'

jest.addMatchers(immutableMatchers)

const setStateWith = (state, pathInMeta = [], value) => {
    return {
        ...state,
        currentAccount: state.currentAccount
            .update((currentAccount) => currentAccount.setIn(pathInMeta, value))
    }
}

describe('current account selectors', () => {
    let state

    beforeEach(() => {
        state = {
            currentAccount: initialState.mergeDeep(fromJS(currentAccountFixtures.currentAccountState)),
        }
    })

    it('getCurrentAccountState', () => {
        expect(selectors.getCurrentAccountState(state)).toEqualImmutable(state.currentAccount)
        expect(selectors.getCurrentAccountState({})).toEqualImmutable(fromJS({}))
    })

    it('getCurrentAccountMeta', () => {
        expect(selectors.getCurrentAccountMeta(state)).toEqualImmutable(state.currentAccount.get('meta'))
        expect(selectors.getCurrentAccountMeta({})).toEqualImmutable(fromJS({}))
    })

    it('getAccountStatus', () => {
        expect(selectors.getAccountStatus(state)).toEqualImmutable(state.currentAccount.get('status'))
        expect(selectors.getAccountStatus({})).toEqualImmutable(fromJS({}))
    })

    it('isAccountActive', () => {
        expect(selectors.isAccountActive(state)).toBe(true)
        expect(selectors.isAccountActive({})).toBe(false)
    })

    it('getCurrentSubscription', () => {
        expect(selectors.getCurrentSubscription(state)).toEqualImmutable(state.currentAccount.get('current_subscription'))
        expect(selectors.getCurrentSubscription({})).toEqualImmutable(fromJS({}))
    })

    it('hasCreditCard', () => {
        expect(selectors.hasCreditCard(setStateWith(state, ['meta', 'hasCreditCard'], true))).toBe(true)
        expect(selectors.hasCreditCard(setStateWith(state, ['meta', 'hasCreditCard'], false))).toBe(false)
        expect(selectors.hasCreditCard({})).toBe(false)
    })

    it('shouldPayWithShopify', () => {
        expect(selectors.shouldPayWithShopify(setStateWith(state, ['meta', 'should_pay_with_shopify'], true))).toBe(true)
        expect(selectors.shouldPayWithShopify(setStateWith(state, ['meta', 'should_pay_with_shopify'], false))).toBe(false)
        expect(selectors.shouldPayWithShopify({})).toBe(false)
    })

    it('doesPayWithShopify', () => {
        expect(selectors.doesPayWithShopify(setStateWith(state, ['meta', 'shopify_billing', 'active'], true))).toBe(true)
        expect(selectors.doesPayWithShopify(setStateWith(state, ['meta', 'shopify_billing', 'active'], false))).toBe(false)
        expect(selectors.doesPayWithShopify({})).toBe(false)
    })

    it('paymentMethod', () => {
        expect(selectors.paymentMethod(setStateWith(state, ['meta', 'should_pay_with_shopify'], true))).toBe('shopify')
        expect(selectors.paymentMethod(setStateWith(state, ['meta', 'should_pay_with_shopify'], false))).toBe('stripe')
        expect(selectors.paymentMethod({})).toBe('stripe')
    })

    it('paymentIsActive', () => {
        expect(selectors.paymentIsActive(setStateWith(setStateWith(state, ['meta', 'shopify_billing', 'active'], true), ['meta', 'should_pay_with_shopify'], true))).toBe(true)
        expect(selectors.paymentIsActive(setStateWith(setStateWith(state, ['meta', 'shopify_billing', 'active'], false), ['meta', 'should_pay_with_shopify'], true))).toBe(false)
        expect(selectors.paymentIsActive(setStateWith(setStateWith(state, ['meta', 'hasCreditCard'], true), ['meta', 'should_pay_with_shopify'], false))).toBe(true)
        expect(selectors.paymentIsActive(setStateWith(setStateWith(state, ['meta', 'hasCreditCard'], false), ['meta', 'should_pay_with_shopify'], false))).toBe(false)
        expect(selectors.paymentIsActive({})).toBe(false)
    })

    it('getChatSettings', () => {
        expect(selectors.getChatSettings(setStateWith(state, ['settings'], fromJS([{type: 'chat'}])))).toEqualImmutable(fromJS({type: 'chat'}))
        expect(selectors.getChatSettings(setStateWith(state, ['settings'], fromJS([{type: 'unknown'}])))).toEqualImmutable(fromJS({}))
        expect(selectors.getChatSettings({})).toEqualImmutable(fromJS({}))
    })
})
