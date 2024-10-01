import React from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {useElements} from '@stripe/react-stripe-js'
import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {StripeElements} from '@stripe/stripe-js/dist'
import useAppSelector from 'hooks/useAppSelector'
import {getContactEmail} from 'state/billing/selectors'
import {assumeMock} from 'utils/testing'
import {BillingAddressSetupView} from './BillingAddressSetupView'

jest.mock('react-redux')
jest.mock('@stripe/react-stripe-js')
jest.mock('hooks/useAppSelector')
jest.mock('state/billing/selectors')

let addressElementChangeHandler: (
    event: StripeAddressElementChangeEvent
) => any = () => {}

assumeMock(useElements).mockReturnValue({
    getElement: jest.fn().mockReturnValue({
        on: jest.fn().mockImplementation((_, handler) => {
            addressElementChangeHandler = handler
        }),
    }),
} as unknown as StripeElements)

jest.mock('../../components/StripeAddressElement/StripeAddressElement', () => ({
    StripeAddressElement: () => <div data-testid="stripe-address-element" />,
}))

jest.mock(
    '../../components/StripeElementsProvider/StripeElementsProvider',
    () => ({
        StripeElementsProvider: ({children}: any) => (
            <div data-testid="stripe-elements-provider">{children}</div>
        ),
    })
)
assumeMock(getContactEmail).mockReturnValue('test@example.com')
assumeMock(useAppSelector).mockImplementation((selector) => selector({} as any))

describe('BillingAddressSetupView', () => {
    it('should render the component correctly', () => {
        render(<BillingAddressSetupView />)
        expect(screen.getByText('Billing Information')).toBeVisible()
        expect(screen.getByText('Email')).toBeVisible()
        expect(screen.getByRole('button', {name: 'Set Address'})).toBeVisible()
        expect(screen.getByTestId('stripe-address-element')).toBeInTheDocument()
    })

    it('should disable the submit button and show an error when the email is invalid', async () => {
        render(<BillingAddressSetupView />)

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

    it('should disable the submit button when the address is incomplete', () => {
        render(<BillingAddressSetupView />)

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
        render(<BillingAddressSetupView />)

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
        render(<BillingAddressSetupView />)

        expect(screen.getByDisplayValue('test@example.com')).toBeVisible()
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
