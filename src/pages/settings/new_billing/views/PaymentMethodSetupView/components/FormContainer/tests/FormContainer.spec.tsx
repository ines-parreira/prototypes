import React from 'react'

import {
    AddressElement,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js'
import {
    StripeAddressElementChangeEvent,
    StripePaymentElementChangeEvent,
} from '@stripe/stripe-js'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import {
    basicMonthlyHelpdeskPlan,
    currentProductsUsage,
    products,
} from 'fixtures/productPrices'
import client from 'models/api/resources'
import { ProductType } from 'models/billing/types'
import {
    BILLING_BASE_PATH,
    BILLING_PAYMENT_PATH,
    SELECTED_PRODUCTS_SESSION_STORAGE_KEY,
} from 'pages/settings/new_billing/constants'
import { SelectedPlans } from 'pages/settings/new_billing/views/BillingProcessView/BillingProcessView'
import { FormContainer } from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/FormContainer/FormContainer'
import type { BillingContactDetailResponse } from 'state/billing/types'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

jest.mock('@stripe/react-stripe-js')

assumeMock(AddressElement).mockImplementation(() => (
    <div data-testid="stripe-address-element" />
))

let handlePaymentElementChange:
    | ((event: StripePaymentElementChangeEvent) => void)
    | undefined

assumeMock(PaymentElement).mockImplementation(({ onChange }) => {
    handlePaymentElementChange = onChange

    return <div data-testid="stripe-payment-element" />
})

assumeMock(useElements).mockReturnValue({} as any)
assumeMock(useStripe).mockReturnValue({
    confirmSetup: jest
        .fn()
        .mockResolvedValue({ setupIntent: { id: 'si_123' } }),
} as any)

let handlePaymentElementOnChangeEvent:
    | ((event: StripePaymentElementChangeEvent) => void)
    | undefined

const mockStripeElementsValue = ({
    address = { address: {} } as any,
    paymentMethod,
}: {
    address?: Partial<StripeAddressElementChangeEvent>
    paymentMethod?: Partial<StripePaymentElementChangeEvent>
}) => {
    assumeMock(useElements).mockReturnValue({
        getElement: (element: string) => ({
            getValue: jest
                .fn()
                .mockResolvedValue(
                    element === 'address' ? address : paymentMethod,
                ),
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'change') {
                    handlePaymentElementOnChangeEvent = callback
                }
            }),
        }),
    } as any)

    act(() => {
        handlePaymentElementChange?.(paymentMethod as any)
        handlePaymentElementOnChangeEvent?.(paymentMethod as any)
    })
}

jest.mock('@gorgias/helpdesk-client')

const mockedServer = new MockAdapter(client)

const initialReduxState: Partial<RootState> = {
    billing: fromJS({
        currentProductsUsage,
        products,
    }),
}

describe('FormContainer', () => {
    it('should redirect to the "Usage & Plans" tab when is starting subscription', async () => {
        mockedServer.onPut('/api/billing/contact/').reply(200, {})

        const shipping = {
            name: 'John Doe',
            address: {
                line1: '123 Main St',
                line2: null,
                city: 'San Francisco',
                state: 'CA',
                postal_code: '94111',
                country: 'US',
            },
        }

        mockStripeElementsValue({
            address: {
                complete: true,
                value: shipping,
            },
            paymentMethod: {
                complete: true,
                value: {
                    type: 'card',
                },
            },
        })

        const selectedProducts: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: basicMonthlyHelpdeskPlan,
                isSelected: true,
                autoUpgrade: false,
            },
            [ProductType.Automation]: {
                isSelected: false,
            },
            [ProductType.Voice]: { isSelected: false },
            [ProductType.SMS]: { isSelected: false },
            [ProductType.Convert]: { isSelected: false },
        }

        sessionStorage.setItem(
            SELECTED_PRODUCTS_SESSION_STORAGE_KEY,
            JSON.stringify(selectedProducts),
        )

        const { history } = renderWithStoreAndQueryClientAndRouter(
            <FormContainer
                hasCreditCard={true}
                billingInformation={{
                    email: 'example@gorgias.com',
                    shipping,
                }}
                dispatchBillingError={() => {}}
            />,
            initialReduxState,
        )

        mockStripeElementsValue({
            address: {
                complete: true,
                value: shipping,
            },
            paymentMethod: {
                complete: true,
                value: {
                    type: 'card',
                },
            },
        })

        expect(history.location.pathname).toBe('/')

        fireEvent.click(screen.getByLabelText(/I agree to the/))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Subscribe now' }),
            ).toBeAriaEnabled()
        })

        fireEvent.click(screen.getByRole('button', { name: 'Subscribe now' }))

        await waitFor(() => {
            expect(history.location.pathname).toBe(BILLING_BASE_PATH)
        })
    })

    it('should redirect to the "Payment Information" tab when is not starting subscription', async () => {
        mockStripeElementsValue({
            paymentMethod: {
                complete: true,
                value: {
                    type: 'card',
                },
            },
        })

        const { history } = renderWithStoreAndQueryClientAndRouter(
            <FormContainer
                hasCreditCard={true}
                billingInformation={
                    {
                        email: 'example@gorgias.com',
                        shipping: {
                            address: {
                                country: 'FR',
                                postal_code: '75001',
                            },
                        },
                    } as BillingContactDetailResponse
                }
                dispatchBillingError={() => {}}
            />,
            {
                ...initialReduxState,
                currentAccount: fromJS({
                    current_subscription: fromJS({
                        status: 'active',
                    }),
                }),
            },
        )

        mockStripeElementsValue({
            paymentMethod: {
                complete: true,
                value: {
                    type: 'card',
                },
            },
        })

        expect(history.location.pathname).toBe('/')

        fireEvent.click(
            screen.getByRole('button', { name: 'Update payment method' }),
        )

        await waitFor(() => {
            expect(history.location.pathname).toBe(BILLING_PAYMENT_PATH)
        })
    })
})
