import React from 'react'

import { assumeMock } from '@repo/testing'
import { AddressElement, useElements } from '@stripe/react-stripe-js'
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import { BILLING_PAYMENT_PATH } from 'pages/settings/new_billing/constants'
import { FormContainer } from 'pages/settings/new_billing/views/BillingAddressSetupView/components/FormContainer'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

jest.mock('@stripe/stripe-js')
jest.mock('@stripe/react-stripe-js')

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

        fireEvent.click(
            screen.getByRole('button', { name: 'Save Billing Information' }),
        )

        await waitFor(() => {
            expect(history.location.pathname).toBe(BILLING_PAYMENT_PATH)
        })
    })
})
