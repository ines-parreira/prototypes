import {AddressElement, Elements, useElements} from '@stripe/react-stripe-js'
import {
    loadStripe,
    StripeAddressElementChangeEvent,
    type Stripe,
} from '@stripe/stripe-js'
import {fireEvent, screen, waitFor, act} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import client from 'models/api/resources'

import {renderWithStoreAndQueryClientAndRouter} from 'tests/renderWithStoreAndQueryClientAndRouter'
import {assumeMock} from 'utils/testing'

import {BillingAddressSetupView} from '../BillingAddressSetupView'

jest.mock('hooks/useAppSelector')

jest.mock('@stripe/stripe-js')

assumeMock(loadStripe).mockResolvedValue({} as Stripe)
window.STRIPE_PUBLIC_KEY = 'pk_test_123'

jest.mock('@stripe/react-stripe-js')

assumeMock(Elements).mockImplementation(({children}: any) => (
    <div data-testid="stripe-elements">{children}</div>
))

let handleAddressChange: (event: StripeAddressElementChangeEvent) => any

assumeMock(AddressElement).mockImplementation(({onChange}) => {
    handleAddressChange = onChange ?? (() => {})

    return <div data-testid="stripe-address-element" />
})

const mockAddressValue = (event: Partial<StripeAddressElementChangeEvent>) => {
    assumeMock(useElements).mockReturnValue({
        getElement: jest.fn().mockReturnValue({
            getValue: jest.fn().mockResolvedValue(event),
        }),
    } as any)

    act(() => {
        handleAddressChange(event as any)
    })
}

const mockedServer = new MockAdapter(client)

mockedServer.onGet('/api/billing/contact/').reply(200, {
    email: 'test@example.com',
    shipping: {},
})

mockedServer.onPut('/api/billing/contact/').reply(201, {})

describe('BillingAddressSetupView', () => {
    it('should render the component correctly', async () => {
        renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        expect(screen.getByText('Billing Information')).toBeVisible()
        expect(screen.getByText('Email')).toBeVisible()
        expect(screen.getByRole('button', {name: 'Set Address'})).toBeVisible()
        expect(screen.getByTestId('stripe-address-element')).toBeInTheDocument()
    })

    it('should enable the submit button when the address is complete and the email is valid', async () => {
        renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        // The initial email is valid, so it shouldn't show an email validationerror
        expect(screen.queryByText('Email is invalid')).not.toBeInTheDocument()

        // Should show the notice that invoices are sent to this email address
        expect(
            screen.getByText('Invoices are sent to this email address.')
        ).toBeVisible()

        mockAddressValue({
            complete: true,
            value: {address: {postal_code: '12345', country: 'US'}},
        } as StripeAddressElementChangeEvent)

        await waitFor(() => {
            // The address is complete and the email is valid, so the submit button should be enabled
            expect(
                screen.getByRole('button', {name: 'Set Address'})
            ).not.toBeAriaDisabled()
        })
    })

    it('should update the email state when input changes', async () => {
        renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        expect(
            screen.queryByDisplayValue('new@example.com')
        ).not.toBeInTheDocument()

        fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {
            target: {value: 'new@example.com'},
        })

        await waitFor(() => {
            expect(
                screen.queryByDisplayValue('test@example.com')
            ).not.toBeInTheDocument()
            expect(screen.getByDisplayValue('new@example.com')).toBeVisible()
        })
    })

    it('should not submit empty tax ID fields (they are required)', async () => {
        mockFlags({
            [FeatureFlagKey.BillingTaxIdField]: true,
        })

        renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {
            target: {value: 'new@example.com'},
        })

        mockAddressValue({
            complete: true,
            value: {address: {country: 'FR', postal_code: '75019'}},
        } as StripeAddressElementChangeEvent)

        await waitFor(() => {
            expect(
                screen.getByRole('textbox', {name: 'VAT Number info'})
            ).toBeVisible()
        })

        fireEvent.click(
            screen.getByRole('button', {name: 'Save Billing Information'})
        )

        fireEvent.change(
            screen.getByRole('textbox', {name: 'VAT Number info'}),
            {
                target: {value: 'FRAB123456789'},
            }
        )

        await waitFor(() => {
            expect(screen.queryByDisplayValue('FRAB123456789')).toBeVisible()
        })

        await waitFor(() => {
            expect(mockedServer.history.post).toHaveLength(0)
        })

        fireEvent.click(
            screen.getByRole('button', {name: 'Save Billing Information'})
        )

        await waitFor(() => {
            expect(mockedServer.history.put).toHaveLength(1)
        })
    })
})
