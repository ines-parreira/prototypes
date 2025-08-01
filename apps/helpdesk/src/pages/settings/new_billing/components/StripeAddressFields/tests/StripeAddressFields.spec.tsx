import React from 'react'

import { assumeMock } from '@repo/testing'
import { AddressElement, useElements } from '@stripe/react-stripe-js'
import { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { Form } from 'core/forms'
import { FormSubmitButton } from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'
import { StripeAddressFields } from 'pages/settings/new_billing/components/StripeAddressFields/StripeAddressFields'

jest.mock('@stripe/react-stripe-js')

let handleAddressElementChange:
    | ((event: StripeAddressElementChangeEvent) => void)
    | undefined

assumeMock(AddressElement).mockImplementation(({ onChange }) => {
    handleAddressElementChange = onChange

    return <div>Address Element</div>
})

const mockValue = (event: Partial<StripeAddressElementChangeEvent>) => {
    assumeMock(useElements).mockReturnValue({
        getElement: jest.fn().mockReturnValue({
            getValue: jest.fn().mockResolvedValue(event),
        }),
    } as any)

    act(() => {
        handleAddressElementChange?.(event as any)
    })
}

describe('StripeAddressFields', () => {
    it('should validate completion', async () => {
        const handleValidSubmit = jest.fn()
        const handleInvalidSubmit = jest.fn()

        render(
            <Form
                onValidSubmit={handleValidSubmit}
                onInvalidSubmit={handleInvalidSubmit}
            >
                <StripeAddressFields />
                <FormSubmitButton />
            </Form>,
        )

        mockValue({ complete: false })

        expect(handleValidSubmit).not.toHaveBeenCalled()
        expect(handleInvalidSubmit).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(handleValidSubmit).not.toHaveBeenCalled()
            expect(handleInvalidSubmit).toHaveBeenCalled()
        })
    })

    it('should validate postal code for US', async () => {
        const handleValidSubmit = jest.fn()
        const handleInvalidSubmit = jest.fn()

        render(
            <Form
                onValidSubmit={handleValidSubmit}
                onInvalidSubmit={handleInvalidSubmit}
            >
                <StripeAddressFields />
                <FormSubmitButton />
            </Form>,
        )

        mockValue({
            complete: true,
            value: { address: { postal_code: '00000', country: 'US' } } as any,
        })

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(screen.getByText('Postal code is invalid')).toBeVisible()
        })
    })
})
