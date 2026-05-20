import { renderHook } from '@repo/testing'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import { TicketPurpose } from 'state/billing/types'

import useDispatchBillingError from '../useDispatchBillingError'

describe('useDispatchBillingError', () => {
    const mockContactBilling = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('shows an error toast with a "Contact Billing" action for unknown errors', async () => {
        const { result } = renderHook(() =>
            useDispatchBillingError(mockContactBilling),
        )

        act(() => {
            result.current(new Error('boom'))
        })

        const toastEl = await screen.findByRole('status', {
            name: "We couldn't update your subscription. Please try again.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')

        const button = within(toastEl).getByRole('button', {
            name: 'Contact Billing',
        })
        fireEvent.click(button)

        expect(mockContactBilling).toHaveBeenCalledWith(TicketPurpose.ERROR)
    })

    it('shows the BE error message when the error is a GorgiasApiError', async () => {
        const apiError = {
            isAxiosError: true,
            response: {
                status: 500,
                data: {
                    error: { msg: 'Backend went sideways' },
                },
            },
        }

        const { result } = renderHook(() =>
            useDispatchBillingError(mockContactBilling),
        )

        act(() => {
            result.current(apiError)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Backend went sideways' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
