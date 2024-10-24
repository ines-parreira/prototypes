import {confirmBillingPaymentMethodSetup} from '@gorgias/api-client'
import {useElements} from '@stripe/react-stripe-js'
import {
    SetupIntentResult,
    StripeAddressElementChangeEvent,
    StripePaymentElementChangeEvent,
} from '@stripe/stripe-js'
import {fireEvent, waitFor, screen, act} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import React from 'react'

import {account} from 'fixtures/account'
import {products} from 'fixtures/productPrices'
import client from 'models/api/resources'
import {EmailInputField} from 'pages/settings/new_billing/components/EmailInputField/EmailInputField'
import {
    BILLING_BASE_PATH,
    BILLING_PAYMENT_PATH,
} from 'pages/settings/new_billing/constants'
import {renderWithStoreAndQueryClientAndRouter} from 'tests/renderWithStoreAndQueryClientAndRouter'
import {assumeMock} from 'utils/testing'

import {Form} from '../Form'

jest.mock('@stripe/react-stripe-js', () => ({
    useStripe: jest.fn(() => ({
        confirmSetup: jest
            .fn()
            .mockResolvedValue({setupIntent: {id: 'id'}} as SetupIntentResult),
    })),
    useElements: jest.fn(() => ({getElement: jest.fn()})),
}))

jest.mock('@gorgias/api-client')

const mockedServer = new MockAdapter(client)

mockedServer.onPut('/api/billing/contact/').reply(200, {})
assumeMock(confirmBillingPaymentMethodSetup).mockResolvedValue({} as any)

describe('Form', () => {
    let paymentChangeHandler: (event: StripePaymentElementChangeEvent) => void
    let addressChangeHandler: (event: StripeAddressElementChangeEvent) => void

    describe('when subscription is not trialing or canceled', () => {
        const mockInitialStoreState = {
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    status: 'active',
                },
            }),
            billing: fromJS({
                invoices: [],
                products,
                currentProductsUsage: {},
            }),
        }

        beforeEach(() => {
            assumeMock(useElements).mockReturnValue({
                getElement: jest.fn((element) => {
                    if (element === 'payment') {
                        return {
                            on: jest.fn((_event, handler) => {
                                paymentChangeHandler = handler
                            }),
                        }
                    }

                    return null
                }),
            } as any)
        })

        it('should render form with Update card button when subscription is not trialing or canceled', () => {
            renderWithStoreAndQueryClientAndRouter(
                <Form
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                />,
                mockInitialStoreState
            )

            expect(
                screen.getByRole('button', {name: 'Update card'})
            ).toBeVisible()
        })

        it('should redirect to BILLING_PAYMENT_PATH when submit is successful', async () => {
            const {history} = renderWithStoreAndQueryClientAndRouter(
                <Form
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                />,
                mockInitialStoreState
            )

            expect(history.location.pathname).not.toBe(BILLING_PAYMENT_PATH)

            expect(
                screen.getByRole('button', {name: 'Update card'})
            ).toBeAriaDisabled()

            act(() => {
                paymentChangeHandler({
                    complete: true,
                } as any)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {name: 'Update card'})
                ).not.toBeAriaDisabled()
            })

            fireEvent.click(screen.getByRole('button', {name: 'Update card'}))

            await waitFor(() => {
                expect(history.location.pathname).toBe(BILLING_PAYMENT_PATH)
            })
        })
    })

    describe('when subscription is trialing', () => {
        const mockInitialStoreState = {
            currentAccount: fromJS(account),
            billing: fromJS({
                invoices: [],
                products,
                currentProductsUsage: {},
            }),
        }

        beforeEach(() => {
            assumeMock(useElements).mockReturnValue({
                getElement: jest.fn((element) => {
                    if (element === 'payment') {
                        return {
                            on: jest.fn((_event, handler) => {
                                paymentChangeHandler = handler
                            }),
                        }
                    }

                    return {
                        on: jest.fn((_event, handler) => {
                            addressChangeHandler = handler
                        }),
                        getSelf: jest.fn().mockReturnValue(true),
                    }
                }),
            } as any)
        })

        it('should redirect to BILLING_BASE_PATH when submit is successful', async () => {
            const {history} = renderWithStoreAndQueryClientAndRouter(
                <Form
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                >
                    <EmailInputField />
                </Form>,
                mockInitialStoreState
            )

            expect(history.location.pathname).not.toBe(BILLING_BASE_PATH)

            expect(
                screen.getByRole('button', {name: 'Subscribe now'})
            ).toBeAriaDisabled()

            act(() => {
                paymentChangeHandler({
                    complete: true,
                } as any)
            })

            act(() => {
                addressChangeHandler({
                    complete: true,
                    value: {
                        address: {
                            postal_code: '12345',
                            country: 'US',
                        },
                    },
                } as any)
            })

            fireEvent.input(
                screen.getByRole('textbox', {name: 'Email required'}),
                {
                    target: {value: 'example@gorgias.com'},
                }
            )

            fireEvent.click(
                screen.getByRole('checkbox', {
                    name: 'I agree to the Gorgias Master Subscription Agreement and Terms . Learn about how we use and protect your data in our Privacy Policy .',
                })
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {name: 'Subscribe now'})
                ).not.toBeAriaDisabled()
            })

            fireEvent.click(screen.getByRole('button', {name: 'Subscribe now'}))

            await waitFor(() => {
                expect(history.location.pathname).toBe(BILLING_BASE_PATH)
            })
        })
    })
})
