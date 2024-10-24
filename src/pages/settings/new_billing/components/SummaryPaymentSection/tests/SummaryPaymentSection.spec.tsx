import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    HELPDESK_PRODUCT_ID,
    products,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import {RootState, StoreDispatch} from 'state/types'

import SummaryPaymentSection from '../SummaryPaymentSection'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const mockedSetIsPaymentEnabled = jest.fn()
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const props = {
    isCreditCardFetched: true,
    setIsPaymentEnabled: mockedSetIsPaymentEnabled,
}

describe('SummaryPaymentSection', () => {
    it('should render expired credit card - Stripe', () => {
        const store = mockedStore({
            billing: fromJS({
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.price_id,
                        },
                    },
                }),
                products,
                creditCard: fromJS({
                    exp_month: 12,
                    exp_year: new Date().getFullYear() - 1,
                    last4: '4242',
                    brand: 'Visa',
                }),
            }),
        })

        const {getByTestId} = render(
            <Provider store={store}>
                <SummaryPaymentSection {...props} />
            </Provider>
        )
        expect(getByTestId('cardIsExpired')).toBeInTheDocument()
    })

    it('should render no payment method - Stripe', () => {
        const store = mockedStore({
            billing: fromJS({
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.price_id,
                        },
                    },
                }),
                products,
                creditCard: null,
            }),
        })

        const {getByTestId} = render(
            <Provider store={store}>
                <SummaryPaymentSection {...props} />
            </Provider>
        )
        expect(getByTestId('noPaymentMethod')).toBeInTheDocument()
    })

    it('should render credit card - Stripe', () => {
        const store = mockedStore({
            billing: fromJS({
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.price_id,
                        },
                    },
                }),
                products,
                creditCard: fromJS({
                    exp_month: 12,
                    exp_year: new Date().getFullYear() + 1,
                    last4: '4242',
                    brand: 'Visa',
                }),
            }),
        })

        const {getByTestId} = render(
            <Provider store={store}>
                <SummaryPaymentSection {...props} />
            </Provider>
        )
        expect(getByTestId('validCreditCard')).toBeInTheDocument()
    })

    it('should render inactive payment method - Shopify', () => {
        const store = mockedStore({
            billing: fromJS({
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.price_id,
                        },
                    },
                }),
                products,
            }),
            currentAccount: fromJS({
                meta: {
                    should_pay_with_shopify: true,
                },
            }),
        })

        render(
            <Provider store={store}>
                <SummaryPaymentSection {...props} />
            </Provider>
        )

        expect(
            screen.getByText(/Payment with Shopify is inactive/)
        ).toBeInTheDocument()
    })

    it('should render valid payment method - Shopify', () => {
        const store = mockedStore({
            billing: fromJS({
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.price_id,
                        },
                    },
                }),
                products,
            }),
            currentAccount: fromJS({
                meta: {
                    should_pay_with_shopify: true,
                    shopify_billing: {active: true},
                },
            }),
        })

        render(
            <Provider store={store}>
                <SummaryPaymentSection {...props} />
            </Provider>
        )

        expect(
            screen.getByText(/Payment with Shopify is active/)
        ).toBeInTheDocument()
    })

    it('should render canceled payment method - Shopify', () => {
        const store = mockedStore({
            billing: fromJS({
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPlan.price_id,
                        },
                    },
                }),
                products,
            }),
            currentAccount: fromJS({
                meta: {
                    should_pay_with_shopify: true,
                    shopify_billing: {charge_id: '123'},
                },
            }),
        })

        render(
            <Provider store={store}>
                <SummaryPaymentSection {...props} />
            </Provider>
        )

        expect(
            screen.getByText(/Payment with Shopify is canceled/)
        ).toBeInTheDocument()
    })
})
