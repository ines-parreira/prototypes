import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { AddressElement, Elements, useElements } from '@stripe/react-stripe-js'
import type { Stripe, StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { act } from 'react-dom/test-utils'

import { billingContact } from 'fixtures/resources'
import client from 'models/api/resources'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { BillingAddressSetupView } from '../BillingAddressSetupView'

jest.mock('@repo/logging')
jest.mock('hooks/useAppSelector')

const logEventMock = assumeMock(logEvent)

jest.mock('@stripe/stripe-js')

assumeMock(loadStripe).mockResolvedValue({} as Stripe)
window.STRIPE_PUBLIC_KEY = 'pk_test_123'

jest.mock('@stripe/react-stripe-js')

assumeMock(Elements).mockImplementation(({ children }: any) => (
    <div data-testid="stripe-elements">{children}</div>
))

let handleAddressChange: (event: StripeAddressElementChangeEvent) => any

assumeMock(AddressElement).mockImplementation(({ onChange }) => {
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

mockedServer.onGet('/api/billing/contact/').reply(200, billingContact)

mockedServer.onPut('/api/billing/contact/').reply(201, {})

describe('BillingAddressSetupView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        logEventMock.mockClear()
    })

    it('should render the component correctly', async () => {
        renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

        await waitFor(() => {
            expect(screen.getByDisplayValue(billingContact.email)).toBeVisible()
        })

        expect(screen.getByText('Billing Information')).toBeVisible()
        expect(screen.getByText('Email')).toBeVisible()
        expect(
            screen.getByRole('button', { name: 'Save Billing Information' }),
        ).toBeVisible()
        expect(screen.getByTestId('stripe-address-element')).toBeInTheDocument()
    })

    it('should enable the submit button when the address is complete and the email is valid', async () => {
        renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

        await waitFor(() => {
            expect(screen.getByDisplayValue(billingContact.email)).toBeVisible()
        })

        // The initial email is valid, so it shouldn't show an email validationerror
        expect(screen.queryByText('Email is invalid')).not.toBeInTheDocument()

        // Should show the notice that invoices are sent to this email address
        expect(
            screen.getByText('Invoices are sent to this email address.'),
        ).toBeVisible()

        mockAddressValue({
            complete: true,
            value: { address: { postal_code: '12345', country: 'US' } },
        } as StripeAddressElementChangeEvent)

        await waitFor(() => {
            // The address is complete and the email is valid, so the submit button should be enabled
            expect(
                screen.getByRole('button', {
                    name: 'Save Billing Information',
                }),
            ).not.toBeAriaDisabled()
        })
    })

    it('should update the email state when input changes', async () => {
        const user = userEvent.setup()
        renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

        await waitFor(() => {
            expect(screen.getByDisplayValue(billingContact.email)).toBeVisible()
        })

        expect(
            screen.queryByDisplayValue('new@example.com'),
        ).not.toBeInTheDocument()

        await act(() =>
            user.clear(screen.getByRole('textbox', { name: 'Email' })),
        )
        await act(() =>
            user.type(
                screen.getByRole('textbox', { name: 'Email' }),
                'new@example.com',
            ),
        )

        expect(
            screen.queryByDisplayValue(billingContact.email),
        ).not.toBeInTheDocument()
        expect(screen.getByDisplayValue('new@example.com')).toBeVisible()
    })

    it('should not submit empty tax ID fields (they are required)', async () => {
        const user = userEvent.setup()
        renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

        await waitFor(() => {
            expect(screen.getByDisplayValue(billingContact.email)).toBeVisible()
        })

        await act(() =>
            user.clear(screen.getByRole('textbox', { name: 'Email' })),
        )
        await act(() =>
            user.type(
                screen.getByRole('textbox', { name: 'Email' }),
                'new@example.com',
            ),
        )

        mockAddressValue({
            complete: true,
            value: { address: { country: 'FR', postal_code: '75019' } },
        } as StripeAddressElementChangeEvent)

        await waitFor(() => {
            expect(
                screen.getByRole('textbox', { name: 'VAT Number info' }),
            ).toBeVisible()
        })

        await act(() =>
            user.clear(
                screen.getByRole('textbox', { name: 'VAT Number info' }),
            ),
        )
        await act(() =>
            user.type(
                screen.getByRole('textbox', { name: 'VAT Number info' }),
                'FRAB123456789',
            ),
        )

        await waitFor(() => {
            expect(screen.queryByDisplayValue('FRAB123456789')).toBeVisible()
        })

        await act(() =>
            user.click(
                screen.getByRole('button', {
                    name: 'Save Billing Information',
                }),
            ),
        )

        await waitFor(() => {
            expect(mockedServer.history.put).toHaveLength(1)
        })
    })

    describe('BillingPaymentInformationBillingInformationVisited tracking', () => {
        it('should track event when billing information page is visited', () => {
            renderWithStoreAndQueryClientAndRouter(<BillingAddressSetupView />)

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingPaymentInformationBillingInformationVisited,
                {
                    url: '/',
                },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
    })
})
