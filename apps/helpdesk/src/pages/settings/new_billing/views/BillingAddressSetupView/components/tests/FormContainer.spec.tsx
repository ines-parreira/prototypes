import { BILLING_PAYMENT_PATH } from '@repo/billing'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { AddressElement, useElements } from '@stripe/react-stripe-js'
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { act } from 'react-dom/test-utils'

import client from 'models/api/resources'
import { FormContainer } from 'pages/settings/new_billing/views/BillingAddressSetupView/components/FormContainer'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

jest.mock('@repo/logging')
jest.mock('@stripe/stripe-js')
jest.mock('@stripe/react-stripe-js')

const logEventMock = assumeMock(logEvent)

let handleAddressChange: (event: StripeAddressElementChangeEvent) => any

assumeMock(AddressElement).mockImplementation(({ onChange }) => {
    handleAddressChange = onChange ?? (() => {})

    return <div data-testid="address-element" />
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

describe('FormContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        logEventMock.mockClear()
        mockedServer.resetHistory()
    })

    const shipping = {
        name: 'John Doe',
        address: {
            line1: '123 Main St',
            line2: 'Apt 4',
            city: 'San Francisco',
            state: 'CA',
            postal_code: '94111',
            country: 'US',
        },
        phone: '123456789',
    }

    it('should submit valid billing address', async () => {
        mockedServer.onPut('/api/billing/contact/').reply(200, {})

        const user = userEvent.setup()
        const { history } = renderWithStoreAndQueryClientAndRouter(
            <FormContainer
                billingInformation={{
                    email: 'example@gorgias.com',
                    shipping,
                }}
            />,
        )

        mockAddressValue({ complete: true, value: shipping })

        expect(history.location.pathname).toBe('/')

        await act(() =>
            user.click(
                screen.getByRole('button', {
                    name: 'Save Billing Information',
                }),
            ),
        )

        expect(history.location.pathname).toBe(BILLING_PAYMENT_PATH)
    })

    describe('BillingPaymentInformationSaveBillingInformationClicked tracking', () => {
        it('should track event when Save Billing Information button is clicked', async () => {
            mockedServer.onPut('/api/billing/contact/').reply(200, {})

            const user = userEvent.setup()
            renderWithStoreAndQueryClientAndRouter(
                <FormContainer
                    billingInformation={{
                        email: 'example@gorgias.com',
                        shipping,
                    }}
                />,
            )

            mockAddressValue({ complete: true, value: shipping })

            logEventMock.mockClear()

            await act(() =>
                user.click(
                    screen.getByRole('button', {
                        name: 'Save Billing Information',
                    }),
                ),
            )

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingPaymentInformationSaveBillingInformationClicked,
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
            expect(mockedServer.history.put).toHaveLength(1)
        })
    })
})
