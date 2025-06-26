/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import UpdatePaymentTermsPage from '../UpdatePaymentTerms'

jest.mock(
    'pages/settings/new_billing/hooks/useUpdatePaymentTermsWithSideEffects',
    () => ({
        useUpdatePaymentTermsWithSideEffects: jest.fn(),
    }),
)

jest.mock(
    'pages/settings/new_billing/hooks/useGetPaymentTermsWithSideEffects',
    () => ({
        useGetPaymentTermsWithSideEffects: jest.fn(),
    }),
)

const useUpdatePaymentTermsWithSideEffectsMock = jest.requireMock(
    'pages/settings/new_billing/hooks/useUpdatePaymentTermsWithSideEffects',
).useUpdatePaymentTermsWithSideEffects

const useGetPaymentTermsWithSideEffectsMock = jest.requireMock(
    'pages/settings/new_billing/hooks/useGetPaymentTermsWithSideEffects',
).useGetPaymentTermsWithSideEffects

useGetPaymentTermsWithSideEffectsMock.mockImplementation(() => {
    return {
        data: { data: { payment_terms: 45 } },
        isLoading: false,
    }
})

describe('Update Payment Terms Page', () => {
    const mutateMock = jest.fn()

    beforeEach(() => {
        useUpdatePaymentTermsWithSideEffectsMock.mockImplementation(() => {
            return {
                mutate: mutateMock,
                isLoading: false,
            }
        })

        useGetPaymentTermsWithSideEffectsMock.mockImplementation(() => {
            return {
                data: { data: { payment_terms: 45 } },
                isLoading: false,
            }
        })
    })

    it('renders correctly with default payment terms set to 30', () => {
        render(<UpdatePaymentTermsPage />)

        expect(screen.getByText('Update Payment Terms')).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByText('45')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled()
    })

    it('the form remains valid and button remains valid, when changing the payment terms to 45', async () => {
        render(<UpdatePaymentTermsPage />)
        const input = screen.getByRole('combobox')

        await userEvent.click(input)

        const option = await screen.findByRole('option', { name: /45/i })

        await userEvent.click(option)

        const button = screen.getByRole('button', { name: 'Update' })
        expect(button).toBeEnabled()
    })

    it('clicking the button triggers the mutation', async () => {
        render(<UpdatePaymentTermsPage />)
        const input = screen.getByRole('combobox')

        await userEvent.click(input)

        const option = await screen.findByRole('option', { name: /60/i })

        await userEvent.click(option)

        const button = screen.getByRole('button', { name: 'Update' })

        // Ensure the button is enabled
        expect(button).toBeEnabled()

        await userEvent.click(button)

        expect(useUpdatePaymentTermsWithSideEffectsMock).toHaveBeenCalledTimes(
            1,
        )
        await waitFor(() => {
            expect(mutateMock).toHaveBeenCalledTimes(1)
            expect(mutateMock).toHaveBeenCalledWith({
                data: { payment_terms: 60 },
            })
        })
    })

    it('the button should be disabled when the payment terms are loading', () => {
        useUpdatePaymentTermsWithSideEffectsMock.mockImplementation(() => {
            return {
                mutate: mutateMock,
                isLoading: true,
            }
        })
        render(<UpdatePaymentTermsPage />)
        const button = screen.getByText('Update')
        expect(button).toBeAriaDisabled()
        expect(mutateMock).not.toHaveBeenCalled()
    })
})
