import { fromJS } from 'immutable'

import { automationSubscriptionProductPrices } from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan1,
    customHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPlan,
    SMS_PRODUCT_ID,
    smsAvailablePlans,
    smsPlan1,
    starterHelpdeskPlan,
    VOICE_PRODUCT_ID,
    voiceAvailablePlans,
    voicePlan1,
} from 'fixtures/plans'
import type { Plan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import { AccountFeature } from 'state/currentAccount/types'
import type { RootState } from 'state/types'

import { initialState } from '../reducers'
import * as selectors from '../selectors'

describe('billing selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                },
            }),
            billing: initialState.mergeDeep(billingFixtures.billingState),
            integrations: fromJS({
                // 6 active integrations to test plan integrations limits
                integrations: [
                    { id: 1 },
                    { id: 2 },
                    { id: 3 },
                    { id: 4 },
                    { id: 5 },
                    { id: 6 },
                ],
            }),
        } as RootState
    })

    it('getBillingState (deprecated)', () => {
        expect(
            selectors.DEPRECATED_getBillingState({} as RootState),
        ).toEqualImmutable(fromJS({}))
        expect(selectors.DEPRECATED_getBillingState(state)).toEqualImmutable(
            state.billing,
        )
    })

    it('getBillingState', () => {
        expect(selectors.getBillingState(state)).toEqual(state.billing.toJS())
    })

    it('creditCard', () => {
        expect(selectors.creditCard({} as RootState)).toEqualImmutable(
            fromJS({}),
        )
        expect(selectors.creditCard(state)).toEqualImmutable(
            state.billing.get('creditCard'),
        )
    })

    it('paymentMethod', () => {
        expect(selectors.paymentMethod({} as RootState)).toBe('')
        expect(selectors.paymentMethod(state)).toEqualImmutable(
            state.billing.get('paymentMethod'),
        )
    })

    it('getCurrentUsage', () => {
        expect(selectors.getCurrentUsage({} as RootState)).toEqualImmutable(
            fromJS({}),
        )
        expect(selectors.getCurrentUsage(state)).toEqualImmutable(
            state.billing.get('currentUsage'),
        )
    })

    it('getCurrentProductUsage', () => {
        expect(selectors.getCurrentProductsUsage({} as RootState)).toEqual(
            undefined,
        )

        expect(selectors.getCurrentProductsUsage(state)).toEqual(
            state.billing.get('currentProductsUsage').toJS(),
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
                }),
            ).toBeTruthy()
        })

        it('should return false', () => {
            expect(selectors.getHasAutomate(state)).toBeFalsy()
        })
    })

    describe('getProducts', () => {
        it('should return products', () => {
            expect(
                selectors.getAvailablePlansByProduct(state),
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

        it('doesnt fail if there are no helpdesk plans available', () => {
            const plans = selectors.getAvailableHelpdeskPlans({
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: [],
                }),
            })

            expect(plans).toEqual([])
        })
    })

    describe('getAvailableAutomatePlans', () => {
        it('should return the AI Agent plans', () => {
            const plans = selectors.getAvailableAutomatePlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.Automation)
            })
        })

        it('doesnt fail if there are no AI Agent plans available', () => {
            const plans = selectors.getAvailableAutomatePlans({
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: [],
                }),
            })

            expect(plans).toEqual([])
        })
    })

    describe('getAvailableVoicePlans', () => {
        it('should return the Voice plans', () => {
            const plans = selectors.getAvailableVoicePlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.Voice)
            })
        })

        it('doesnt fail if there are no Voice plans available', () => {
            const plans = selectors.getAvailableVoicePlans({
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: [],
                }),
            })

            expect(plans).toEqual([])
        })
    })

    describe('getAvailableSmsPlans', () => {
        it('should return the SMS plans', () => {
            const plans = selectors.getAvailableSmsPlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.SMS)
            })
        })

        it('doesnt fail if there are no SMS plans available', () => {
            const plans = selectors.getAvailableSmsPlans({
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: [],
                }),
            })

            expect(plans).toEqual([])
        })
    })

    describe('getAvailableConvertPlans', () => {
        it('should return the Convert plans', () => {
            const plans = selectors.getAvailableConvertPlans(state)

            plans.forEach((plan) => {
                expect(plan.product).toEqual(ProductType.Convert)
            })
        })

        it('doesnt fail if there are no Convert plans available', () => {
            const plans = selectors.getAvailableConvertPlans({
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: [],
                }),
            })

            expect(plans).toEqual([])
        })
    })

    describe('getCurrentHelpdeskProduct', () => {
        it('should return the current helpdesk product', () => {
            expect(selectors.getCurrentHelpdeskPlan(state)).toEqual(
                basicMonthlyHelpdeskPlan,
            )
        })
    })

    describe('getCurrentAutomationProduct', () => {
        it('should return the current AI Agent product', () => {
            expect(
                selectors.getCurrentAutomatePlan({
                    ...state,
                    currentAccount: state.currentAccount.setIn(
                        [
                            'current_subscription',
                            'products',
                            AUTOMATION_PRODUCT_ID,
                        ],
                        basicMonthlyAutomationPlan.plan_id,
                    ),
                }),
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
                        voicePlan1.plan_id,
                    ),
                }),
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
                        smsPlan1.plan_id,
                    ),
                }),
            ).toEqual(smsPlan1)
        })
    })

    describe('getCurrentConvertProduct', () => {
        it('should return the current Convert product', () => {
            expect(
                selectors.getCurrentConvertPlan({
                    ...state,
                    currentAccount: state.currentAccount.setIn(
                        [
                            'current_subscription',
                            'products',
                            CONVERT_PRODUCT_ID,
                        ],
                        convertPlan1.plan_id,
                    ),
                }),
            ).toEqual(convertPlan1)
        })
    })

    describe('currentAccountHasProduct', () => {
        it('should indicate if the account has the product', () => {
            expect(
                selectors.currentAccountHasProduct(ProductType.Helpdesk)(state),
            ).toBe(true)
            expect(
                selectors.currentAccountHasProduct(ProductType.Voice)(state),
            ).toBe(false)
        })
    })

    describe('getCheapestSMSPlan', () => {
        it('should return the cheapest non-zero SMS plan', () => {
            expect(selectors.getCheapestSMSPlan(state)).toEqual(smsPlan1)
        })
    })

    describe('getCheapestVoicePlan', () => {
        it('should return the cheapest non-zero Voice plan', () => {
            expect(selectors.getCheapestVoicePlan(state)).toEqual(voicePlan1)
        })
    })

    describe('getCheapestConvertPlan', () => {
        it('should return the cheapest non-zero Convert plan', () => {
            expect(selectors.getCheapestConvertPlan(state)).toEqual(
                convertPlan1,
            )
        })
    })

    describe('getCurrentHelpdeskName', () => {
        it('should return the current product name', () => {
            expect(selectors.getCurrentHelpdeskPlanName(state)).toBe('Basic')
        })
    })

    describe('getCurrentHelpdeskCadence', () => {
        it('should return the product cadence', () => {
            expect(selectors.getCurrentHelpdeskCadence(state)).toBe(
                Cadence.Month,
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
                            product.plan_id,
                        ),
                        billing: state.billing.mergeIn(
                            ['products', 0, 'prices'],
                            fromJS([legacyBasicHelpdeskPlan]),
                        ),
                    }),
                ).toBe(product.is_legacy)
            },
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
                            product.plan_id,
                        ),
                        billing: state.billing.mergeIn(
                            ['products', 0, 'prices'],
                            fromJS([customHelpdeskPlan]),
                        ),
                    }),
                ).toBe(!!product.custom)
            },
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
                        basicMonthlyAutomationPlan.plan_id,
                    ),
                }),
            ).toMatchSnapshot()
        })
    })

    describe('getCurrentPlansByProduct', () => {
        it('should return the current products', () => {
            const products = {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.plan_id,
                [VOICE_PRODUCT_ID]: voicePlan1.plan_id,
                [SMS_PRODUCT_ID]: smsPlan1.plan_id,
                [CONVERT_PRODUCT_ID]: convertPlan1.plan_id,
            }
            const currentPlansByProduct = selectors.getCurrentPlansByProduct({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products'],
                    fromJS(products),
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

        it('should return the current products even if products is billing-provider agnostic', () => {
            const products = {
                [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan.plan_id,
                [ProductType.Automation]: basicMonthlyAutomationPlan.plan_id,
                [ProductType.Voice]: voicePlan1.plan_id,
                [ProductType.SMS]: smsPlan1.plan_id,
                [ProductType.Convert]: convertPlan1.plan_id,
            }
            const currentPlansByProduct = selectors.getCurrentPlansByProduct({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products'],
                    fromJS(products),
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
            // This is a case that should happen only on when account is subscribed to an internal plan
            // e.g. revenue beta testers plans
            const currentPlansByProduct = selectors.getCurrentPlansByProduct({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products', CONVERT_PRODUCT_ID],
                    'plan_unknown_id',
                ),
            })

            expect(
                currentPlansByProduct && 'helpdesk' in currentPlansByProduct,
            ).toBe(true)
            expect(
                currentPlansByProduct && 'convert' in currentPlansByProduct,
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

    describe('getAvailablePlans', () => {
        it('should return the available plans', () => {
            expect(selectors.getAvailablePlans(state)).toMatchSnapshot()
        })
    })

    describe('getAvailablePlansMap', () => {
        it('should return PlanId-Plan mapping', () => {
            const expected = billingFixtures.billingState.products
                .flatMap((product) => product.prices)
                .reduce<{ [key: string]: Plan }>((acc, plan) => {
                    acc[plan.plan_id] = plan
                    return acc
                }, {})

            expect(selectors.getAvailablePlansMap(state)).toEqual(expected)
        })
    })

    describe('getAvailablePlansMapByPlanId', () => {
        it('should return the available plans map', () => {
            const expected = billingFixtures.billingState.products
                .flatMap((product) => product.prices)
                .reduce<{ [key: string]: Plan }>((acc, plan) => {
                    acc[plan.plan_id] = plan
                    return acc
                }, {})

            expect(selectors.getAvailablePlansMapByPlanId(state)).toEqual(
                expected,
            )
        })
    })

    describe('getAvailableAutomatePlansMap', () => {
        it('should return a PlanId-Plan mapping', () => {
            const expected = billingFixtures.billingState.products
                .filter((product) => product.type === ProductType.Automation)
                .flatMap((product) => product.prices)
                .reduce<{ [key: string]: Plan }>((acc, plan) => {
                    acc[plan.plan_id] = plan
                    return acc
                }, {})

            expect(selectors.getAvailableAutomatePlansMap(state)).toEqual(
                expected,
            )
        })
    })

    describe('getAvailableHelpdeskPlans', () => {
        it('should return the available helpdesk plans', () => {
            expect(selectors.getAvailableHelpdeskPlans(state)).toMatchSnapshot()
        })
    })

    describe('getAvailableAutomatePlans', () => {
        it('should return the AI Agent plans', () => {
            expect(selectors.getAvailableAutomatePlans(state)).toMatchSnapshot()
        })
    })

    describe('getCheapestProductPlans', () => {
        it('should return the cheapest plans for a specific product', () => {
            const cheapestProductPlans =
                selectors.getCheapestProductPlans(state)
            expect(cheapestProductPlans.voice).toEqual(voicePlan1)
            expect(cheapestProductPlans.sms).toEqual(smsPlan1)
            expect(cheapestProductPlans.automation).toEqual(
                basicMonthlyAutomationPlan,
            )
            expect(cheapestProductPlans.helpdesk).toEqual(starterHelpdeskPlan)
            expect(cheapestProductPlans.convert).toEqual(convertPlan1)

            expect(cheapestProductPlans).toMatchSnapshot()
        })
    })

    describe('getIsVettedForPhone', () => {
        it('should return true if one phone product is in the current subscription', () => {
            const products = {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [VOICE_PRODUCT_ID]: voicePlan1.plan_id,
                [SMS_PRODUCT_ID]: smsPlan1.plan_id,
            }
            const isVettedForPhone = selectors.getIsVettedForPhone({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products'],
                    fromJS(products),
                ),
            })
            expect(isVettedForPhone).toBeTruthy()
        })

        it('should return false if no phone product is in the current subscription', () => {
            const products = {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
            }
            const isVettedForPhone = selectors.getIsVettedForPhone({
                ...state,
                currentAccount: state.currentAccount.setIn(
                    ['current_subscription', 'products'],
                    fromJS(products),
                ),
            })

            expect(isVettedForPhone).toBeFalsy()
        })
    })

    describe('getVoiceOrSmsPlanChanged', () => {
        type Configs = [
            string, // name
            boolean, // sms plan changed
            boolean, // voice plan changed
        ]
        const configs: Configs[] = [
            ['no change', false, false],
            ['sms changed', true, false],
            ['voice changed', false, true],
            ['both changed', true, true],
        ]
        it.each(configs)(
            'should report if sms or voice plan has changed: [sms change: %s, voice change: %s]',
            (
                _name: string,
                smsPlanChanged: boolean,
                voicePlanChanged: boolean,
            ) => {
                const currentAccount = state.currentAccount.toJS()
                const originalSMSPlan =
                    currentAccount.current_subscription.products[SMS_PRODUCT_ID]
                const originalVoicePlan =
                    currentAccount.current_subscription.products[
                        VOICE_PRODUCT_ID
                    ]

                const selectedSmsPlan = smsPlanChanged
                    ? smsAvailablePlans.find(
                          (plan) => plan.plan_id !== originalSMSPlan,
                      )
                    : originalSMSPlan
                const selectedVoicePlan = voicePlanChanged
                    ? voiceAvailablePlans.find(
                          (plan) => plan.plan_id !== originalVoicePlan,
                      )
                    : originalVoicePlan

                const f = selectors.getVoiceOrSmsPlanChanged({
                    selectedSmsPlan,
                    selectedVoicePlan,
                })
                const hasChanged = f(state)
                expect(hasChanged).toBe(smsPlanChanged || voicePlanChanged)
            },
        )
    })
})
