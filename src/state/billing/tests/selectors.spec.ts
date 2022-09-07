import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, List, Map} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'

import {Plan} from 'models/billing/types'
import {
    AUTOMATION_PRODUCT_ID,
    automationProduct,
    basicDiscountedAutomationPrice,
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
    basicYearlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    legacyBasicAutomationPrice,
    legacyBasicHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import * as billingFixtures from 'fixtures/billing'
import {automationSubscriptionProductPrices} from 'fixtures/account'
import {RootState} from '../../types'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('billing selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPrice.price_id,
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

    it('getPlans (deprecated)', () => {
        const plans = selectors.DEPRECATED_getPlans(state)

        expect(
            (state.billing.get('products') as List<any>)
                .map(
                    (product: Map<any, any>) =>
                        product.get('prices') as List<any>
                )
                .flatten(1).size
        ).toBe(plans.size)

        plans.forEach((plan: Map<any, any>) => {
            const planJS = plan.toJS()
            expect(planJS).toHaveProperty('amount')
            expect(planJS).toHaveProperty('currencySign')
        })
    })

    it('getPlans', () => {
        const plans = selectors.getPlans(state)

        expect(
            (state.billing.get('products') as List<any>)
                .map(
                    (product: Map<any, any>) =>
                        product.get('prices') as List<any>
                )
                .flatten(1).size
        ).toBe(plans.length)

        plans.forEach((plan: Plan) => {
            expect(plan).toHaveProperty('amount')
            expect(plan).toHaveProperty('currencySign')
        })
    })

    it('getCurrentPlan (deprecated)', () => {
        expect(selectors.DEPRECATED_getCurrentPlan(state).get('id')).toBe(
            basicMonthlyHelpdeskPrice.legacy_id
        )
    })

    it('getCurrentPlan', () => {
        const plan = selectors.getCurrentPlan(state)
        expect(plan?.id).toBe(basicMonthlyHelpdeskPrice.legacy_id)
    })

    it('DEPRECATED_getPlan', () => {
        expect(selectors.DEPRECATED_getPlan('')(state)).toEqualImmutable(
            fromJS({})
        )
        expect(
            selectors
                .DEPRECATED_getPlan('basic-monthly-usd-4')(state)
                .get('name')
        ).toBe(basicMonthlyHelpdeskPrice.name)
        expect(
            selectors
                .DEPRECATED_getPlan(
                    'basic-automation-full-price-monthly-usd-4'
                )(state)
                .get('name')
        ).toBe(basicMonthlyAutomationPrice.name)
    })

    describe('getPlan', () => {
        it('should return undefined when state has no plans', () => {
            expect(
                selectors.getPlan('')({
                    ...state,
                    billing: fromJS({
                        ...billingFixtures.billingState,
                        products: [
                            {...helpdeskProduct, prices: []},
                            {...automationProduct, prices: []},
                        ],
                    }),
                })
            ).toBe(undefined)
        })

        it('should return undefined when plan is not found in the state plans', () => {
            expect(selectors.getPlan('')(state)).toBe(undefined)
        })

        it('should return the plan from the state', () => {
            expect(
                selectors.getPlan('basic-monthly-usd-4')(state)
            ).toMatchSnapshot()
        })
    })

    it('invoices', () => {
        expect(selectors.invoices({} as RootState)).toEqualImmutable(fromJS([]))
        expect(selectors.invoices(state).size).toBe(1)
    })

    it('contact', () => {
        expect(selectors.getContact({} as RootState)).toBe(null)
        expect(selectors.getContact(state)).toEqualImmutable(
            state.billing.get('contact')
        )
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

    it('isAllowedToCreateIntegration', () => {
        expect(
            selectors.isAllowedToCreateIntegration({
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: [
                        {
                            ...helpdeskProduct,
                            prices: [
                                {
                                    ...basicMonthlyHelpdeskPrice,
                                    integrations: 5,
                                },
                            ],
                        },
                        {
                            ...automationProduct,
                            prices: [basicMonthlyAutomationPrice],
                        },
                    ],
                }),
            } as RootState)
        ).toBe(false)
        expect(
            selectors.isAllowedToCreateIntegration({
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: [
                        {
                            ...helpdeskProduct,
                            prices: [
                                {
                                    ...basicMonthlyHelpdeskPrice,
                                    integrations: 7,
                                },
                            ],
                        },
                        {
                            ...automationProduct,
                            prices: [basicMonthlyAutomationPrice],
                        },
                    ],
                }),
            } as RootState)
        ).toBe(true)
    })

    it('planIntegrations', () => {
        expect(selectors.planIntegrations(state)).toBe(150)
    })

    it('isAllowedToChangePlan', () => {
        expect(
            selectors.isAllowedToChangePlan('basic-yearly-usd-4')({
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: [
                        {
                            ...helpdeskProduct,
                            prices: [
                                basicMonthlyHelpdeskPrice,
                                {
                                    ...basicYearlyHelpdeskPrice,
                                    integrations: 5,
                                },
                            ],
                        },
                        {
                            ...automationProduct,
                            prices: [basicMonthlyAutomationPrice],
                        },
                    ],
                }),
            } as RootState)
        ).toBe(false)
        expect(
            selectors.isAllowedToChangePlan('basic-yearly-usd-4')(state)
        ).toBe(true)
    })

    describe('accountHasLegacyPlan', () => {
        const productsWithLegacyPrice = _cloneDeep(products)
        productsWithLegacyPrice[0].prices.push(legacyBasicHelpdeskPrice)
        productsWithLegacyPrice[1].prices.push(legacyBasicAutomationPrice)

        it('should return the proper value for a legacy and non legacy plan', () => {
            expect(selectors.hasLegacyPlan(state)).toBe(false)
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                legacyBasicHelpdeskPrice.price_id,
                        },
                    },
                }),
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: productsWithLegacyPrice,
                }),
            }
            expect(selectors.hasLegacyPlan(state)).toBe(true)
        })
    })

    describe('currentPlanId()', () => {
        it('should return undefined when no current subscription', () => {
            state = {
                ...state,
                billing: fromJS({
                    ...billingFixtures.billingState,
                }),
                currentAccount: fromJS({
                    current_subscription: {
                        products: {[HELPDESK_PRODUCT_ID]: null},
                    },
                }),
            }
            expect(selectors.currentPlanId(state)).toEqual(undefined)
        })

        it('should return plan of the current subscription', () => {
            expect(selectors.currentPlanId(state)).toEqual(
                'basic-monthly-usd-4'
            )
        })

        it('should return the future subscription plan', () => {
            state = {
                currentAccount: fromJS({
                    current_subscription: {
                        products: {[HELPDESK_PRODUCT_ID]: null},
                    },
                }),
                billing: fromJS({
                    ...billingFixtures.billingState,
                    futureSubscriptionPlan: 'future-plan-123',
                }),
            } as RootState
            expect(selectors.currentPlanId(state)).toEqual('future-plan-123')
        })
    })

    describe('getEquivalentAutomationCurrentPlan()', () => {
        it('should return undefined when no current plan', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {[HELPDESK_PRODUCT_ID]: null},
                    },
                }),
            } as RootState
            expect(selectors.getEquivalentAutomationCurrentPlan(state)).toBe(
                undefined
            )
        })

        it('should return automation plan when current plan is regular', () => {
            expect(
                selectors.getEquivalentAutomationCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return automation plan when current plan is also automation', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: automationSubscriptionProductPrices,
                    },
                }),
            }
            expect(
                selectors.getEquivalentAutomationCurrentPlan(state)
            ).toMatchSnapshot()
        })
    })

    describe('getEquivalentRegularCurrentPlan()', () => {
        it('should return undefined when no current plan', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {[HELPDESK_PRODUCT_ID]: null},
                    },
                }),
            } as RootState
            expect(selectors.getEquivalentRegularCurrentPlan(state)).toBe(
                undefined
            )
        })

        it('should return regular plan when current plan is also regular', () => {
            expect(
                selectors.getEquivalentRegularCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return regular plan when current plan is automation', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: automationSubscriptionProductPrices,
                    },
                }),
            }
            expect(
                selectors.getEquivalentRegularCurrentPlan(state)
            ).toMatchSnapshot()
        })
    })

    describe('getAddOnAutomationAmountCurrentPlan()', () => {
        it('should return the amount of automation add-on', () => {
            expect(
                selectors.getAddOnAutomationAmountCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return undefined when equivalent plan does not exist', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                legacyBasicHelpdeskPrice.price_id,
                        },
                    },
                }),
            }
            expect(
                selectors.getAddOnAutomationAmountCurrentPlan(state)
            ).toMatchSnapshot()
        })
    })

    describe('getAddOnAutomationDiscountCurrentPlan()', () => {
        it('should return the discount of automation add-on amount', () => {
            expect(
                selectors.getAddOnAutomationDiscountCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return the add-on amount discount of the current plan when plan is an automation plan', () => {
            const productsWithDiscountedAutomationPrice = _cloneDeep(products)
            productsWithDiscountedAutomationPrice[1].prices.push(
                basicDiscountedAutomationPrice
            )
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPrice.price_id,
                            [AUTOMATION_PRODUCT_ID]:
                                basicDiscountedAutomationPrice.price_id,
                        },
                    },
                }),
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: productsWithDiscountedAutomationPrice,
                }),
            }
            expect(
                selectors.getAddOnAutomationDiscountCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return undefined when equivalent plan does not exist', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                legacyBasicHelpdeskPrice.price_id,
                        },
                    },
                }),
            }
            expect(
                selectors.getAddOnAutomationDiscountCurrentPlan(state)
            ).toMatchSnapshot()
        })
    })

    describe('getAddOnAutomationFullAmountCurrentPlan()', () => {
        it('should return the full amount of automation add-on', () => {
            const productsWithDiscountedAutomationPrice = _cloneDeep(products)
            productsWithDiscountedAutomationPrice[1].prices.push(
                basicDiscountedAutomationPrice
            )

            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPrice.price_id,
                            [AUTOMATION_PRODUCT_ID]:
                                basicDiscountedAutomationPrice.price_id,
                        },
                    },
                }),
                billing: fromJS({
                    ...billingFixtures.billingState,
                    products: productsWithDiscountedAutomationPrice,
                }),
            }
            expect(
                selectors.getAddOnAutomationFullAmountCurrentPlan(state)
            ).toMatchSnapshot()
        })

        it('should return undefined when no automation add-on amount or discount exists', () => {
            state = {
                ...state,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                legacyBasicHelpdeskPrice.price_id,
                        },
                    },
                }),
            }
            expect(
                selectors.getAddOnAutomationFullAmountCurrentPlan(state)
            ).toMatchSnapshot()
        })
    })

    describe('getHasAutomationAddOn()', () => {
        it('should return true', () => {
            expect(
                selectors.getHasAutomationAddOn({
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
            expect(selectors.getHasAutomationAddOn(state)).toBeFalsy()
        })
    })

    describe('isMissingContactInformation', () => {
        it.each([
            null,
            {
                email: '',
                shipping: {
                    address: {
                        country: 'FR',
                        postal_code: '75000',
                    },
                },
            },
            {
                email: 'foo',
                shipping: {
                    address: {
                        country: '',
                        postal_code: '75000',
                    },
                },
            },
            {
                email: 'foo',
                shipping: {
                    address: {
                        country: 'FR',
                        postal_code: '',
                    },
                },
            },
            {
                email: 'foo',
                shipping: {
                    address: {
                        country: 'US',
                        postal_code: '75000',
                    },
                },
            },
        ])(
            'should return true when contact is missing required information',
            (contact) => {
                expect(
                    selectors.isMissingContactInformation({
                        ...state,
                        billing: fromJS({
                            contact,
                        }),
                    })
                ).toBeTruthy()
            }
        )

        it.each([
            {
                email: 'foo',
                shipping: {
                    address: {
                        country: 'FR',
                        postal_code: '75000',
                    },
                },
            },
            {
                email: 'foo',
                shipping: {
                    address: {
                        country: 'US',
                        postal_code: '75000',
                        state: 'CA',
                    },
                },
            },
        ])(
            'should return false when contact is not missing required information',
            (contact) => {
                expect(
                    selectors.isMissingContactInformation({
                        ...state,
                        billing: fromJS({
                            contact,
                        }),
                    })
                ).toBeFalsy()
            }
        )
    })
})
