import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {render, fireEvent, screen, waitFor, act} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import React from 'react'

import client from 'models/api/resources'
import {mockQueryClientProvider} from 'tests/reactQueryTestingUtils'

import {BillingAddressSetupView} from '../BillingAddressSetupView'

jest.mock('react-redux')
jest.mock('hooks/useAppSelector')
jest.mock('state/billing/selectors')

type ChangeEventHandler = (event: StripeAddressElementChangeEvent) => any

let changeEventHandler: ChangeEventHandler = () => {}

const addressElementChangeHandler: (
    event: StripeAddressElementChangeEvent
) => any = (event) => {
    act(() => {
        changeEventHandler(event)
    })
}

jest.mock('@stripe/react-stripe-js', () => ({
    useElements: jest.fn(() => ({
        getElement: jest.fn(() => ({
            on: jest.fn((eventType, handler: ChangeEventHandler) => {
                if (eventType === 'change') {
                    changeEventHandler = handler
                }
            }),
            getValue: jest.fn(),
        })),
    })),
    AddressElement: () => <div data-testid="stripe-address-element" />,
    Elements: ({children}: any) => (
        <div data-testid="stripe-elements">{children}</div>
    ),
}))

const mockedServer = new MockAdapter(client)

mockedServer.onGet('/api/billing/contact/').reply(200, {
    email: 'test@example.com',
})

describe('BillingAddressSetupView', () => {
    it('should render the component correctly', async () => {
        render(<BillingAddressSetupView />, {
            wrapper: mockQueryClientProvider(),
        })

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        expect(screen.getByText('Billing Information')).toBeVisible()
        expect(screen.getByText('Email')).toBeVisible()
        expect(screen.getByRole('button', {name: 'Set Address'})).toBeVisible()
        expect(screen.getByTestId('stripe-address-element')).toBeInTheDocument()
    })

    it('should disable the submit button and show an error when the email is invalid', async () => {
        render(<BillingAddressSetupView />, {
            wrapper: mockQueryClientProvider(),
        })

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        addressElementChangeHandler({
            complete: true,
            value: {address: {postal_code: '12345', country: 'US'}},
        } as StripeAddressElementChangeEvent)

        fireEvent.change(
            screen.getByRole('textbox', {name: 'Email required'}),
            {
                target: {value: 'invalid-email'},
            }
        )

        await waitFor(() => {
            expect(screen.getByText('Email is invalid')).toBeVisible()
            expect(
                screen.getByRole('button', {name: 'Set Address'})
            ).toBeAriaDisabled()
        })
    })

    it('should disable the submit button when the address is incomplete', async () => {
        render(<BillingAddressSetupView />, {
            wrapper: mockQueryClientProvider(),
        })

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        // The initial email is valid, so it shouldn't show an email validationerror
        expect(screen.queryByText('Email is invalid')).not.toBeInTheDocument()

        // Should show the notice that invoices are sent to this email address
        expect(
            screen.getByText('Invoices are sent to this email address.')
        ).toBeVisible()

        expect(
            screen.getByRole('button', {name: 'Set Address'})
        ).toBeAriaDisabled()
    })

    it('should enable the submit button when the address is complete and the email is valid', async () => {
        render(<BillingAddressSetupView />, {
            wrapper: mockQueryClientProvider(),
        })

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        // The initial email is valid, so it shouldn't show an email validationerror
        expect(screen.queryByText('Email is invalid')).not.toBeInTheDocument()

        // Should show the notice that invoices are sent to this email address
        expect(
            screen.getByText('Invoices are sent to this email address.')
        ).toBeVisible()

        addressElementChangeHandler({
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
        render(<BillingAddressSetupView />, {
            wrapper: mockQueryClientProvider(),
        })

        await waitFor(() => {
            expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
        })

        expect(
            screen.queryByDisplayValue('new@example.com')
        ).not.toBeInTheDocument()

        fireEvent.change(
            screen.getByRole('textbox', {name: 'Email required'}),
            {
                target: {value: 'new@example.com'},
            }
        )

        await waitFor(() => {
            expect(
                screen.queryByDisplayValue('test@example.com')
            ).not.toBeInTheDocument()
            expect(screen.getByDisplayValue('new@example.com')).toBeVisible()
        })
    })
})
