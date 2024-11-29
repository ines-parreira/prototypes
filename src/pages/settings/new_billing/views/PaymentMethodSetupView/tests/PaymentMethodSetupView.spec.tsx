import {createBillingPaymentMethodSetup} from '@gorgias/api-client'
import {screen, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import React from 'react'

import {account} from 'fixtures/account'
import {products} from 'fixtures/productPrices'
import client from 'models/api/resources'
import * as useSetupIntentModule from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSetupIntent'
import {renderWithStoreAndQueryClientProvider} from 'tests/renderWithStoreAndQueryClientProvider'
import {assumeMock} from 'utils/testing'

import {PaymentMethodSetupView} from '../PaymentMethodSetupView'

jest.mock('@stripe/react-stripe-js', () => ({
    useStripe: jest.fn(() => ({confirmSetup: jest.fn()})),
    useElements: jest.fn(() => ({getElement: jest.fn()})),
    Elements: jest.fn(({children}) => (
        <div data-testid="stripe-elements">{children}</div>
    )),
    PaymentElement: jest.fn(() => <div data-testid="stripe-payment-element" />),
    AddressElement: jest.fn(() => <div data-testid="stripe-address-element" />),
}))

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div data-testid="loader" />
))

jest.mock('@gorgias/api-client')

const mockedServer = new MockAdapter(client)

const mockInitialStoreState = {
    currentAccount: fromJS({account}),
    billing: fromJS({
        invoices: [],
        products,
        currentProductsUsage: {},
    }),
}

describe('PaymentMethodSetupView', () => {
    it('should render Loader when setup intent is loading', () => {
        mockedServer.onGet('/api/billing/credit-card/').reply(200, {})
        mockedServer.onGet('/api/billing/contact/').reply(200, {shipping: {}})
        assumeMock(createBillingPaymentMethodSetup).mockResolvedValue(
            new Promise(() => {})
        )

        renderWithStoreAndQueryClientProvider(
            <PaymentMethodSetupView dispatchBillingError={jest.fn()} />
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should render Loader when hasCreditCard is loading', () => {
        mockedServer
            .onGet('/api/billing/credit-card/')
            .reply(() => new Promise(() => {}))
        mockedServer.onGet('/api/billing/contact/').reply(200, {shipping: {}})
        assumeMock(createBillingPaymentMethodSetup).mockResolvedValue({
            data: {client_secret: 'client-secret', id: 'id'},
        } as any)

        renderWithStoreAndQueryClientProvider(
            <PaymentMethodSetupView dispatchBillingError={jest.fn()} />
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should render StripeElementsProvider and form when setup intent and credit card are available', async () => {
        mockedServer.onGet('/api/billing/credit-card/').reply(200, {})
        mockedServer
            .onGet('/api/billing/contact/')
            .reply(200, {shipping: {address: {}}})
        assumeMock(createBillingPaymentMethodSetup).mockResolvedValue({
            data: {client_secret: 'client-secret', id: 'id'},
        } as any)

        renderWithStoreAndQueryClientProvider(
            <PaymentMethodSetupView dispatchBillingError={jest.fn()} />,
            mockInitialStoreState
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByTestId('stripe-elements')).toBeInTheDocument()
            expect(
                screen.getByTestId('stripe-payment-element')
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('stripe-address-element')
            ).toBeInTheDocument()
            expect(screen.getByText('Email')).toBeVisible()
        })
    })

    it('should not render EmailInputField and StripeAddressElement if user has credit card', async () => {
        mockedServer
            .onGet('/api/billing/credit-card/')
            .reply(200, {brand: 'visa'})
        mockedServer.onGet('/api/billing/contact/').reply(200, {shipping: {}})

        assumeMock(createBillingPaymentMethodSetup).mockResolvedValue({
            data: {client_secret: 'client-secret', id: 'id'},
        } as any)

        renderWithStoreAndQueryClientProvider(
            <PaymentMethodSetupView dispatchBillingError={jest.fn()} />,
            {
                ...mockInitialStoreState,
                currentAccount: fromJS({
                    current_subscription: fromJS({
                        status: 'active',
                    }),
                }),
            }
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByTestId('stripe-elements')).toBeInTheDocument()
            expect(
                screen.getByTestId('stripe-payment-element')
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('stripe-address-element')
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Email')).not.toBeInTheDocument()
        })
    })

    it("shouldn't render Stripe elements if the setup intent's client secret isn't available", async () => {
        mockedServer.onGet('/api/billing/credit-card/').reply(200, {})
        mockedServer.onGet('/api/billing/contact/').reply(200, {shipping: {}})

        assumeMock(createBillingPaymentMethodSetup).mockResolvedValue({
            data: {id: 'id'},
        } as any)

        const useSetupIntentSpy = jest.spyOn(
            useSetupIntentModule,
            'useSetupIntent'
        )

        renderWithStoreAndQueryClientProvider(
            <PaymentMethodSetupView dispatchBillingError={jest.fn()} />,
            mockInitialStoreState
        )

        expect(screen.getByTestId('loader')).toBeVisible()

        await waitFor(() => {
            expect(useSetupIntentSpy).toHaveReturnedWith(
                expect.objectContaining({
                    isSuccess: true,
                    clientSecret: undefined,
                })
            )
        })

        expect(screen.queryByTestId('stripe-elements')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('stripe-payment-element')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('stripe-address-element')
        ).not.toBeInTheDocument()
    })
})
