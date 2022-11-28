import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'

import {
    AUTOMATION_PRODUCT_ID,
    automationProduct,
    basicDiscountedAutomationPrice,
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
    basicYearlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    legacyBasicHelpdeskPrice,
    products,
    customHelpdeskPrice,
} from 'fixtures/productPrices'
import * as billingFixtures from 'fixtures/billing'
import {automationSubscriptionProductPrices} from 'fixtures/account'
import {PlanInterval} from 'models/billing/types'
import {getFormattedAmount} from 'models/billing/utils'
import {AccountFeature} from 'state/currentAccount/types'
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

    it('getCurrentHelpdeskMaxIntegrations', () => {
        expect(selectors.getCurrentHelpdeskMaxIntegrations(state)).toBe(150)
    })

    it('makeGetIsAllowedToChangePrice', () => {
        expect(
            selectors.makeGetIsAllowedToChangePrice({
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
            } as RootState)(basicYearlyHelpdeskPrice.price_id)
        ).toBe(false)
        expect(
            selectors.makeGetIsAllowedToChangePrice(state)(
                basicYearlyHelpdeskPrice.price_id
            )
        ).toBe(true)
    })

    describe('getCurrentHelpdeskAutomationAddonAmount()', () => {
        it('should return the amount of automation add-on', () => {
            expect(
                selectors.getCurrentHelpdeskAutomationAddonAmount(state)
            ).toMatchSnapshot()
        })

        it('should return undefined when addon does not exist', () => {
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
                selectors.getCurrentHelpdeskAutomationAddonAmount(state)
            ).toMatchSnapshot()
        })
    })

    describe('getCurrentAutomationFullAmount()', () => {
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
                selectors.getCurrentAutomationFullAmount(state)
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
                selectors.getCurrentAutomationFullAmount(state)
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

    describe('getProducts', () => {
        it('should return products', () => {
            expect(selectors.getProducts(state)).toMatchSnapshot()
        })
    })

    describe('getHelpdeskProduct', () => {
        it('should return the helpdesk product', () => {
            expect(selectors.getHelpdeskProduct(state)).toMatchSnapshot()
        })
    })

    describe('getAutomationProduct', () => {
        it('should return the automation product', () => {
            expect(selectors.getAutomationProduct(state)).toMatchSnapshot()
        })
    })

    describe('getCurrentHelpdeskProduct', () => {
        it('should return the current helpdesk product', () => {
            expect(selectors.getCurrentHelpdeskProduct(state)).toEqual(
                basicMonthlyHelpdeskPrice
            )
        })
    })

    describe('getCurrentAutomationProduct', () => {
        it('should return the current automation product', () => {
            expect(
                selectors.getCurrentAutomationProduct({
                    ...state,
                    currentAccount: state.currentAccount.setIn(
                        [
                            'current_subscription',
                            'products',
                            AUTOMATION_PRODUCT_ID,
                        ],
                        basicMonthlyAutomationPrice.price_id
                    ),
                })
            ).toEqual(basicMonthlyAutomationPrice)
        })
    })

    describe('getCurrentHelpdeskName', () => {
        it('should return the current product name', () => {
            expect(selectors.getCurrentHelpdeskName(state)).toBe('Basic')
        })
    })

    describe('getCurrentProductsAmount', () => {
        it('should return the amount for the current products', () => {
            expect(
                selectors.getCurrentProductsAmount({
                    ...state,
                    currentAccount: state.currentAccount.setIn(
                        [
                            'current_subscription',
                            'products',
                            AUTOMATION_PRODUCT_ID,
                        ],
                        basicMonthlyAutomationPrice.price_id
                    ),
                })
            ).toBe(90)
        })
    })

    describe('getCurrentHelpdeskAddons', () => {
        it('should return the product addons', () => {
            expect(selectors.getCurrentHelpdeskAddons(state)).toEqual(
                basicMonthlyHelpdeskPrice.addons
            )
        })
    })

    describe('getCurrentHelpdeskAmount', () => {
        it('should return the formatted amount', () => {
            expect(selectors.getCurrentHelpdeskAmount(state)).toEqual(
                getFormattedAmount(basicMonthlyHelpdeskPrice.amount)
            )
        })
    })

    describe('getCurrentHelpdeskCurrency', () => {
        it('should return the product currency', () => {
            expect(selectors.getCurrentHelpdeskCurrency(state)).toBe('usd')
        })
    })

    describe('getCurrentHelpdeskFreeTickets', () => {
        it('should return the amount of free tickets', () => {
            expect(selectors.getCurrentHelpdeskFreeTickets(state)).toBe(300)
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
        it.each([basicMonthlyHelpdeskPrice, legacyBasicHelpdeskPrice])(
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
                            fromJS([legacyBasicHelpdeskPrice])
                        ),
                    })
                ).toBe(product.is_legacy)
            }
        )
    })

    describe('getIsCurrentHelpdeskCustom', () => {
        it.each([basicMonthlyHelpdeskPrice, customHelpdeskPrice])(
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
                            fromJS([customHelpdeskPrice])
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
                        basicMonthlyAutomationPrice.price_id
                    ),
                })
            ).toMatchSnapshot()
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
            expect(selectors.getPrices(state)).toMatchSnapshot()
        })
    })

    describe('getHelpdeskPrices', () => {
        it('should return the helpdesk prices', () => {
            expect(selectors.getHelpdeskPrices(state)).toMatchSnapshot()
        })
    })
})
