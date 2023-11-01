import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'
import {createStripeCardToken} from 'utils/stripe'
import {account} from 'fixtures/account'

import {
    AUTOMATION_PRODUCT_ID,
    HELPDESK_PRODUCT_ID,
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import {renderWithRouter} from 'utils/testing'
import {SELECTED_PRODUCTS_SESSION_STORAGE_KEY} from 'pages/settings/new_billing/constants'
import PaymentMethodView from '../PaymentMethodView'

const mockedDispatch = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('state/billing/actions', () => ({
    fetchCreditCard: jest.fn(),
    updateCreditCard: jest.fn(),
    fetchContact: () =>
        jest.fn().mockResolvedValue({type: 'FETCH_CONTACT_SUCCESS'}),
    updateContact: () =>
        jest.fn().mockResolvedValue({
            type: 'UPDATE_BILLING_CONTACT_SUCCESS',
        }),
}))
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))
jest.mock('utils/stripe', () => ({
    createStripeCardToken: jest.fn().mockResolvedValue({id: 'stripeTokenId'}),
}))
jest.mock('services/gorgiasApi', () => jest.fn())
jest.mock('common/segment', () => {
    const segmentTracker: Record<string, unknown> =
        jest.requireActual('common/segment')

    return {
        ...segmentTracker,
        logEvent: jest.fn(),
    }
})

Object.defineProperty(window, 'Stripe', {
    value: {
        card: {
            validateCardNumber: jest.fn(),
            validateExpiry: jest.fn(),
            validateCVC: jest.fn(),
        },
    },
    writable: true,
})

jest.mock('utils', () => {
    const utils: Record<string, unknown> = jest.requireActual('utils')
    return {
        ...utils,
        loadScript: jest.fn(),
    }
})

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
            },
        },
    }),
    billing: fromJS({
        invoices: [],
        products,
        contact: {
            email: 'hello@example.com',
            shipping: {
                address: {
                    line1: '123 Main St',
                    line2: 'Apt 1',
                    city: 'New York',
                    state: 'NY',
                    postal_code: '10001',
                    country: 'US',
                },
                phone: '1234567890',
                name: 'John Doe',
            },
        },
        creditCard: fromJS({
            brand: 'Visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2022,
        }),
        currentProductsUsage: {
            helpdesk: {
                data: {
                    extra_tickets_cost_in_cents: 0,
                    num_extra_tickets: 0,
                    num_tickets: 0,
                },
                meta: {
                    subscription_start_datetime: '2021-01-01T00:00:00Z',
                    subscription_end_datetime: '2021-02-01T00:00:00Z',
                },
            },
            automation: null,
            voice: null,
            sms: null,
        },
    }),
})

describe('PaymentMethodView', () => {
    beforeEach(() => {
        const selectedPlans = {
            helpdesk: {
                plan: basicMonthlyHelpdeskPrice,
                isSelected: true,
            },
            automation: {
                isSelected: false,
            },
            voice: {
                isSelected: false,
            },
            sms: {
                isSelected: false,
            },
        }
        window.sessionStorage.setItem(
            SELECTED_PRODUCTS_SESSION_STORAGE_KEY,
            JSON.stringify(selectedPlans)
        )
    })

    it('renders the component', () => {
        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <PaymentMethodView
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                />
            </Provider>
        )

        expect(getByText('Payment Method')).toBeInTheDocument()
        expect(getByText('Name on the card')).toBeInTheDocument()
    })

    it('handles form submission', () => {
        // Mock dependencies and state
        const mockDispatch = jest.fn()
        const mockCreditCard = {
            brand: 'Visa',
            // Add other properties as needed
        }
        jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
        jest.mock('state/billing/selectors', () => ({
            creditCard: jest.fn(() => mockCreditCard),
        }))

        const {getByTestId, getByText} = render(
            <Provider store={store}>
                <PaymentMethodView
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                />
            </Provider>
        )

        // Fill form fields
        const nameInput = getByTestId('name')
        const numberInput = getByTestId('number')
        const expDateInput = getByTestId('expDate')
        const cvcInput = getByTestId('cvc')
        fireEvent.change(nameInput, {target: {value: 'John Doe'}})
        fireEvent.change(numberInput, {target: {value: '1234567890123456'}})
        fireEvent.change(expDateInput, {target: {value: '12/24'}})
        fireEvent.change(cvcInput, {target: {value: '123'}})

        fireEvent.submit(getByText('Update card'))

        expect(createStripeCardToken).toHaveBeenCalledWith({
            name: 'John Doe',
            number: '1234 5678 9012 3456',
            exp_month: 12,
            exp_year: 24,
            cvc: '123',
        })
    })

    it('should show the Summary component with the correct sum for trialing subscription', () => {
        const storeWithTrialingSubscription = mockedStore({
            ...store.getState(),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPrice.price_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicMonthlyAutomationPrice.price_id,
                    },
                    status: 'trialing',
                },
            }),
        })
        const {getByText, getByTestId} = screen

        renderWithRouter(
            <Provider store={storeWithTrialingSubscription}>
                <PaymentMethodView
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                />
            </Provider>
        )

        expect(getByText('Summary')).toBeInTheDocument()

        //We show the total sum based on the selected products from the redux store,
        //not from the session storage, which is used only for canceled subscriptions
        expect(getByTestId('totalSum')).toHaveTextContent('$90')
    })

    it('should show the Summary component with the correct sums for canceled subscription', () => {
        const storeWithCanceledSubscription = mockedStore({
            ...store.getState(),
            currentAccount: fromJS({
                ...account,
                current_subscription: null,
            }),
        })
        const {getByText, getByTestId} = screen

        renderWithRouter(
            <Provider store={storeWithCanceledSubscription}>
                <PaymentMethodView
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                />
            </Provider>
        )

        expect(getByText('Summary')).toBeInTheDocument()

        //Even though there are no current products (as we have for canceled subscription),
        //we still show the total sum based on the selected products from the session storage
        expect(getByTestId('totalSum')).toHaveTextContent('$60')
    })
})
