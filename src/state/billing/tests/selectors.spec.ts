import {fromJS} from 'immutable'

import {automationSubscriptionProductPrices} from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    CONVERT_PRODUCT_ID,
    HELPDESK_PRODUCT_ID,
    SMS_PRODUCT_ID,
    VOICE_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    customHelpdeskPlan,
    legacyBasicHelpdeskPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/productPrices'
import {PlanInterval, ProductType} from 'models/billing/types'
import {AccountFeature} from 'state/currentAccount/types'
import {RootState} from 'state/types'

import {initialState} from '../reducers'
import * as selectors from '../selectors'

describe('billing selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                    },
                },
            }),
            billing: initialState.mergeDeep(billingFixtures.billingState),
            integrations: fromJS({
                // 6 active integrations to test plan integrations limits
                integrations: [
                    {id: 1},
                    {id: 2},
                    {id: 3},
                    {id: 4},
                    {id: 5},
                    {id: 6},
                ],
            }),
        } as RootState
    })

    it('getBillingState (deprecated)', () => {
        expect(
            selectors.DEPRECATED_getBillingState({} as RootState)
        ).toEqualImmutable(fromJS({}))
        expect(selectors.DEPRECATED_getBillingState(state)).toEqualImmutable(
            state.billing
        )
    })

    it('getBillingState', () => {
        expect(selectors.getBillingState(state)).toEqual(state.billing.toJS())
    })

    it('invoices', () => {
        expect(selectors.invoices({} as RootState)).toEqualImmutable(fromJS([]))
        expect(selectors.invoices(state).size).toBe(1)
    })

    it('creditCard', () => {
        expect(selectors.creditCard({} as RootState)).toEqualImmutable(
            fromJS({})
        )
        expect(selectors.creditCard(state)).toEqualImmutable(
            state.billing.get('creditCard')
        )
    })

    it('paymentMethod', () => {
        expect(selectors.paymentMethod({} as RootState)).toBe('')
        expect(selectors.paymentMethod(state)).toEqualImmutable(
            state.billing.get('paymentMethod')
        )
    })

    it('currentUsage', () => {
        expect(selectors.getCurrentUsage({} as RootState)).toEqualImmutable(
            fromJS({})
        )
        expect(selectors.getCurrentUsage(state)).toEqualImmutable(
            state.billing.get('currentUsage')
        )
    })

    it('getCurrentHelpdeskMaxIntegrations', () => {
        expect(selectors.getCurrentHelpdeskMaxIntegrations(state)).toBe(150)
    })

    describe('getHasAutomate()', () => {
        it('should return true', () => {
            expect(
                selectors.getHasAutomate({
                    ...state,
                    currentAccount: fromJS({
                        current_subscription: {
                            products: automationSubscriptionProductPrices,
                        },
                    }),
                })
            ).toBeTruthy()
        })

        it('should return false', () => {
            expect(selectors.getHasAutomate(state)).toBeFalsy()
        })
    })

    describe('getProducts', () => {
        it('should return products', () => {
            expect(
                selectors.getAvailablePlansByProduct(state)
            ).toMatchSnapshot()
        })
    })

    describe('getAvailableHelpdeskPlans', () => {
        it('should return the helpdesk plans', () => {
            const plans = selectors.getAvailableHelpdeskPlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.Helpdesk)
            })
        })
    })

    describe('getAvailableAutomatePlans', () => {
        it('should return the Automate plans', () => {
            const plans = selectors.getAvailableAutomatePlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.Automation)
            })
        })
    })

    describe('getAvailableVoicePlans', () => {
        it('should return the Voice plans', () => {
            const plans = selectors.getAvailableVoicePlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.Voice)
            })
        })
    })

    describe('getAvailableSmsPlans', () => {
        it('should return the SMS plans', () => {
            const plans = selectors.getAvailableSmsPlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.SMS)
            })
        })
    })

    describe('getAvailableConvertPlans', () => {
        it('should return the SMS plans', () => {
            const plans = selectors.getAvailableConvertPlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.Convert)
            })
        })
    })

    describe('getCurrentHelpdeskProduct', () => {
        it('should return the current helpdesk product', () => {
            expect(selectors.getCurrentHelpdeskPlan(state)).toEqual(
                basicMonthlyHelpdeskPlan
            )
        })
    })

    describe('getCurrentAutomationProduct', () => {
        it('should return the current Automate product', () => {
            expect(
                selectors.getCurrentAutomatePlan({
                    ...state,
                    currentAccount: state.currentAccount.setIn(
                        [
                            'current_subscription',
                            'products',
                            AUTOMATION_PRODUCT_ID,
                        ],
                        basicMonthlyAutomationPlan.price_id
                    ),
                })
            ).toEqual(basicMonthlyAutomationPlan)
        })
    })

    describe('getCurrentVoiceProduct', () => {
        it('should return the current voice product', () => {
            expect(
                selectors.getCurrentVoicePlan({
                    ...state,
                    currentAccount: state.currentAccount.setIn(
                        ['current_subscription', 'products', VOICE_PRODUCT_ID],
                        voicePlan1.price_id
                    ),
                })
            ).toEqual(voicePlan1)
        })
    })

    describe('getCurrentSMSProduct', () => {
        it('should return the current SMS product', () => {
            expect(
                selectors.getCurrentSmsPlan({
                    ...state,
                    currentAccount: state.currentAccount.setIn(
                        ['current_subscription', 'products', SMS_PRODUCT_ID],
                        smsPlan1.price_id
                    ),
                })
            ).toEqual(smsPlan1)
        })
    })

    describe('currentAccountHasProduct', () => {
        it('should indicate if the account has the product', () => {
            expect(
                selectors.currentAccountHasProduct(ProductType.Helpdesk)(state)
            ).toBe(true)
            expect(
                selectors.currentAccountHasProduct(ProductType.Voice)(state)
            ).toBe(false)
        })
    })

    describe('getCheapestSMSPrice', () => {
        it('should return the cheapest non-zero SMS price', () => {
            expect(selectors.getCheapestSMSPrice(state)).toEqual(smsPlan1)
        })
    })

    describe('getCheapestVoicePrice', () => {
        it('should return the cheapest non-zero Voice price', () => {
            expect(selectors.getCheapestVoicePrice(state)).toEqual(voicePlan1)
        })
    })

    describe('getCheapestConvertPrice', () => {
        it('should return the cheapest non-zero Convert price', () => {
            expect(selectors.getCheapestConvertPrice(state)).toEqual(
                convertPlan1
            )
        })
    })

    describe('getCurrentHelpdeskName', () => {
        it('should return the current product name', () => {
            expect(selectors.getCurrentHelpdeskPlanName(state)).toBe('Basic')
        })
    })

    describe('getCurrentHelpdeskInterval', () => {
        it('should return the product interval', () => {
            expect(selectors.getCurrentHelpdeskInterval(state)).toBe(
                PlanInterval.Month
            )
        })
    })

    describe('getIsCurrentHelpdeskLegacy', () => {
        it.each([basicMonthlyHelpdeskPlan, legacyBasicHelpdeskPlan])(
            'should return if the product is legacy',
            (product) => {
                expect(
                    selectors.getIsCurrentHelpdeskLegacy({
                        ...state,
                        currentAccount: state.currentAccount.setIn(
                            [
                                'current_subscription',
                                'products',
                                HELPDESK_PRODUCT_ID,
                            ],
                            product.price_id
                        ),
                        billing: state.billing.mergeIn(
                            ['products', 0, 'prices'],
                            fromJS([legacyBasicHelpdeskPlan])
                        ),
                    })
                ).toBe(product.is_legacy)
            }
        )
    })

    describe('getIsCurrentHelpdeskCustom', () => {
        it.each([basicMonthlyHelpdeskPlan, customHelpdeskPlan])(
            'should return if the product is custom',
            (product) => {
                expect(
                    selectors.getIsCurrentHelpdeskCustom({
                        ...state,
                        currentAccount: state.currentAccount.setIn(
                            [
                                'current_subscription',
                                'products',
                                HELPDESK_PRODUCT_ID,
                            ],
                            product.price_id
                        ),
                        billing: state.billing.mergeIn(
                            ['products', 0, 'prices'],
                            fromJS([customHelpdeskPlan])
                        ),
                    })
                ).toBe(!!product.custom)
            }
        )
    })

    describe('getCurrentProductsFeatures', () => {
        it('should return the current features', () => {
            expect(
                selectors.getCurrentProductsFeatures({
                    ...state,
                    currentAccount: state.currentAccount.setIn(
                        [
                            'current_subscription',
                            'products',
                            AUTOMATION_PRODUCT_ID,
                        ],
                        basicMonthlyAutomationPlan.price_id
                    ),
                })
            ).toMatchSnapshot()
        })
    })

    describe('getCurrentPlansByProduct', () => {
        it('should return the current products', () => {
            const products = {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.price_id,
                [VOICE_PRODUCT_ID]: voicePlan1.price_id,
                [SMS_PRODUCT_ID]: smsPlan1.price_id,
                [CONVERT_PRODUCT_ID]: convertPlan1.price_id,
            }
            const currentPlansByProduct = selectors.getCurrentPlansByProduct({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products'],
                    fromJS(products)
                ),
            })

            expect(currentPlansByProduct).toEqual({
                [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan,
                [ProductType.Automation]: basicMonthlyAutomationPlan,
                [ProductType.Voice]: voicePlan1,
                [ProductType.SMS]: smsPlan1,
                [ProductType.Convert]: convertPlan1,
            })
        })

        it('should return the current plans by product without unknown plans for convert', () => {
            // This is a case that should happen only on when account is subscribed to an internal price
            // e.g. revenue beta testers prices
            const currentPlansByProduct = selectors.getCurrentPlansByProduct({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products', CONVERT_PRODUCT_ID],
                    'price_unknown_id'
                ),
            })

            expect(
                currentPlansByProduct && 'helpdesk' in currentPlansByProduct
            ).toBe(true)
            expect(
                currentPlansByProduct && 'convert' in currentPlansByProduct
            ).toBe(false)
        })
    })

    describe('makeHasFeature', () => {
        it.each([
            AccountFeature.FacebookComment,
            AccountFeature.AutomationManagedRules,
        ])('should return if the feature is enabled', (feature) => {
            const hasFeature = selectors.makeHasFeature(state)
            expect(hasFeature(feature)).toMatchSnapshot()
        })
    })

    describe('getPrices', () => {
        it('should return the prices', () => {
            expect(selectors.getAvailablePlans(state)).toMatchSnapshot()
        })
    })

    describe('getHelpdeskPrices', () => {
        it('should return the helpdesk prices', () => {
            expect(selectors.getAvailableHelpdeskPlans(state)).toMatchSnapshot()
        })
    })

    describe('getAutomationPrices', () => {
        it('should return the Automate prices', () => {
            expect(selectors.getAvailableAutomatePlans(state)).toMatchSnapshot()
        })
    })

    describe('getCheapestProductPrices', () => {
        it('should return the cheapest product prices', () => {
            const cheapestProductPrices =
                selectors.getCheapestProductPrices(state)
            expect(cheapestProductPrices.voice).toEqual(voicePlan1)
            expect(cheapestProductPrices.sms).toEqual(smsPlan1)
            expect(cheapestProductPrices.automation).toEqual(
                basicMonthlyAutomationPlan
            )
            expect(cheapestProductPrices.helpdesk).toEqual(
                basicMonthlyHelpdeskPlan
            )
            expect(cheapestProductPrices.convert).toEqual(convertPlan1)

            expect(cheapestProductPrices).toMatchSnapshot()
        })
    })

    describe('getIsVettedForPhone', () => {
        it('should return true if one phone product is in the current subscription', () => {
            const products = {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                [VOICE_PRODUCT_ID]: voicePlan1.price_id,
                [SMS_PRODUCT_ID]: smsPlan1.price_id,
            }
            const isVettedForPhone = selectors.getIsVettedForPhone({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products'],
                    fromJS(products)
                ),
            })
            expect(isVettedForPhone).toBeTruthy()
        })

        it('should return false if no phone product is in the current subscription', () => {
            const products = {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
            }
            const isVettedForPhone = selectors.getIsVettedForPhone({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products'],
                    fromJS(products)
                ),
            })

            expect(isVettedForPhone).toBeFalsy()
        })
    })
})
