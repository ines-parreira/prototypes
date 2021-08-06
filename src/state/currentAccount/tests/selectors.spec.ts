import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import * as accountFixtures from '../../../fixtures/account'
import {AccountFeature, AccountSettingType} from '../types'
import {RootState} from '../../types'

jest.addMatchers(immutableMatchers)

const setStateWith = (
    state: RootState,
    pathInMeta: string[] = [],
    value: unknown
): RootState => {
    return {
        ...state,
        currentAccount: state.currentAccount?.update((currentAccount) =>
            currentAccount.setIn(pathInMeta, value)
        ),
    }
}

describe('current account selectors', () => {
    const defaultState = {
        currentAccount: initialState.mergeDeep(fromJS(accountFixtures.account)),
    } as RootState

    it('getCurrentAccountState', () => {
        expect(selectors.getCurrentAccountState(defaultState)).toEqualImmutable(
            defaultState.currentAccount
        )
        expect(
            selectors.getCurrentAccountState({} as RootState)
        ).toEqualImmutable(fromJS({}))
    })

    it('getCurrentAccountMeta', () => {
        expect(selectors.getCurrentAccountMeta(defaultState)).toEqualImmutable(
            defaultState.currentAccount?.get('meta')
        )
        expect(
            selectors.getCurrentAccountMeta({} as RootState)
        ).toEqualImmutable(fromJS({}))
    })

    it('getAccountStatus', () => {
        expect(selectors.getAccountStatus(defaultState)).toEqualImmutable(
            defaultState.currentAccount?.get('status')
        )
        expect(selectors.getAccountStatus({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('isAccountActive', () => {
        expect(selectors.isAccountActive(defaultState)).toBe(true)
        expect(selectors.isAccountActive({} as RootState)).toBe(false)
    })

    it('getCurrentSubscription', () => {
        expect(selectors.getCurrentSubscription(defaultState)).toEqualImmutable(
            defaultState.currentAccount.get('current_subscription')
        )
        expect(
            selectors.getCurrentSubscription({} as RootState)
        ).toEqualImmutable(fromJS({}))
    })

    it('hasCreditCard', () => {
        expect(
            selectors.hasCreditCard(
                setStateWith(defaultState, ['meta', 'hasCreditCard'], true)
            )
        ).toBe(true)
        expect(
            selectors.hasCreditCard(
                setStateWith(defaultState, ['meta', 'hasCreditCard'], false)
            )
        ).toBe(false)
        expect(selectors.hasCreditCard({} as RootState)).toBe(false)
    })

    it('shouldPayWithShopify', () => {
        expect(
            selectors.shouldPayWithShopify(
                setStateWith(
                    defaultState,
                    ['meta', 'should_pay_with_shopify'],
                    true
                )
            )
        ).toBe(true)
        expect(
            selectors.shouldPayWithShopify(
                setStateWith(
                    defaultState,
                    ['meta', 'should_pay_with_shopify'],
                    false
                )
            )
        ).toBe(false)
        expect(selectors.shouldPayWithShopify({} as RootState)).toBe(false)
    })

    it('getShopifyBillingStatus', () => {
        expect(
            selectors.getShopifyBillingStatus(
                setStateWith(
                    defaultState,
                    ['meta', 'shopify_billing', 'active'],
                    true
                )
            )
        ).toBe('active')
        expect(
            selectors.getShopifyBillingStatus(
                setStateWith(
                    defaultState,
                    ['meta', 'shopify_billing', 'active'],
                    false
                )
            )
        ).toBe('inactive')
        expect(selectors.getShopifyBillingStatus({} as RootState)).toBe(
            'inactive'
        )

        const newState = setStateWith(
            defaultState,
            ['meta', 'shopify_billing'],
            fromJS({active: false, charge_id: '123'})
        )
        expect(selectors.getShopifyBillingStatus(newState)).toBe('canceled')
    })

    it('paymentMethod', () => {
        expect(
            selectors.paymentMethod(
                setStateWith(
                    defaultState,
                    ['meta', 'should_pay_with_shopify'],
                    true
                )
            )
        ).toBe('shopify')
        expect(
            selectors.paymentMethod(
                setStateWith(
                    defaultState,
                    ['meta', 'should_pay_with_shopify'],
                    false
                )
            )
        ).toBe('stripe')
        expect(selectors.paymentMethod({} as RootState)).toBe('stripe')
    })

    it('paymentIsActive', () => {
        expect(
            selectors.paymentIsActive(
                setStateWith(
                    setStateWith(
                        defaultState,
                        ['meta', 'shopify_billing', 'active'],
                        true
                    ),
                    ['meta', 'should_pay_with_shopify'],
                    true
                )
            )
        ).toBe(true)
        expect(
            selectors.paymentIsActive(
                setStateWith(
                    setStateWith(
                        defaultState,
                        ['meta', 'shopify_billing', 'active'],
                        false
                    ),
                    ['meta', 'should_pay_with_shopify'],
                    true
                )
            )
        ).toBe(false)
        expect(
            selectors.paymentIsActive(
                setStateWith(
                    setStateWith(defaultState, ['meta', 'hasCreditCard'], true),
                    ['meta', 'should_pay_with_shopify'],
                    false
                )
            )
        ).toBe(true)
        expect(
            selectors.paymentIsActive(
                setStateWith(
                    setStateWith(
                        defaultState,
                        ['meta', 'hasCreditCard'],
                        false
                    ),
                    ['meta', 'should_pay_with_shopify'],
                    false
                )
            )
        ).toBe(false)
        expect(selectors.paymentIsActive({} as RootState)).toBe(false)
    })

    describe.each<[string, (state: RootState) => unknown, Map<any, any>]>([
        [
            'getSurveySettings',
            selectors.getSurveysSettings,
            fromJS({type: AccountSettingType.SatisfactionSurveys}),
        ],
        [
            'getBusinessHoursSettings',
            selectors.getBusinessHoursSettings,
            fromJS({type: AccountSettingType.BusinessHours}),
        ],
        [
            'getTicketAssignmentSettings',
            selectors.getTicketAssignmentSettings,
            fromJS({type: AccountSettingType.TicketAssignment}),
        ],
        [
            'getViewsOrderingSetting',
            selectors.DEPRECATED_getViewsOrderingSetting,
            fromJS({type: AccountSettingType.ViewsOrdering}),
        ],
    ])('%s', (testName, selector, expectedResult) => {
        it('should return the setting', () => {
            const state = setStateWith(
                defaultState,
                ['settings'],
                fromJS([expectedResult])
            )
            expect(selector(state)).toEqualImmutable(expectedResult)
        })

        it('should return an empty map when no setting found', () => {
            const state = setStateWith(
                defaultState,
                ['settings'],
                fromJS([{type: 'unknown'}])
            )
            expect(selector(state)).toEqualImmutable(fromJS({}))
        })

        it('should return an empty map when state is empty', () => {
            expect(selector({} as RootState)).toEqualImmutable(fromJS({}))
        })
    })

    describe('getViewOrderingSettingJS', () => {
        it('should return the setting', () => {
            const setting = {type: AccountSettingType.ViewsOrdering}
            const state = setStateWith(
                defaultState,
                ['settings'],
                fromJS([setting])
            )
            expect(selectors.getViewsOrderingSetting(state)).toEqual(setting)
        })

        it('should return the empty object when state is empty', () => {
            expect(selectors.getViewsOrderingSetting({} as RootState)).toEqual(
                {}
            )
        })
    })

    describe('currentAccountHasFeature()', () => {
        it.each(Object.values(AccountFeature))(
            'should return true for feature %s',
            (feature) => {
                expect(
                    selectors.currentAccountHasFeature(feature)(defaultState)
                ).toBe(true)
            }
        )

        it('should return false', () => {
            const feature = AccountFeature.AutoAssignment

            expect(
                selectors.currentAccountHasFeature(feature)(
                    setStateWith(defaultState, ['features', feature], {
                        enabled: false,
                    })
                )
            ).toBe(false)
        })
    })
})
