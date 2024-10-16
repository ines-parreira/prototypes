import {act} from '@testing-library/react-hooks'
import {useElements, useStripe} from '@stripe/react-stripe-js'
import {waitFor} from '@testing-library/react'
import {useBillingContact} from 'models/billing/queries'
import {assumeMock} from 'utils/testing'
import {renderHookWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {useConfirmStripeSetupIntent} from './useConfirmStripeSetupIntent'

jest.mock('@stripe/react-stripe-js')

jest.mock('models/billing/queries')

const mockShipping = {
    name: 'Test User',
    address: {
        line1: '123 Test St',
        line2: 'Apt 1',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'US',
    },
    phone: '1234567890',
}

const mockBillingContactResponse = {
    data: {
        data: {
            shipping: mockShipping,
            email: 'test@example.com',
        },
    },
}

describe('useConfirmStripeSetupIntent hook', () => {
    it('should call stripe.confirmSetup with correct params', async () => {
        const mockConfirmStripe = jest.fn()

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: mockConfirmStripe,
        } as any)

        assumeMock(useElements).mockReturnValue('mockElements' as any)

        assumeMock(useBillingContact).mockReturnValue(
            mockBillingContactResponse as any
        )

        const {result} = renderHookWithQueryClientProvider(
            useConfirmStripeSetupIntent
        )

        act(() => {
            result.current.mutate([])
        })

        await waitFor(() => {
            expect(mockConfirmStripe).toHaveBeenCalledWith({
                elements: 'mockElements',
                redirect: 'if_required',
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            ...mockShipping,
                            email: 'test@example.com',
                        },
                    },
                },
            })
        })
    })

    it('should reject if stripe is not initialized', async () => {
        assumeMock(useStripe).mockReturnValue(null)

        assumeMock(useBillingContact).mockReturnValue({} as any)

        const {result} = renderHookWithQueryClientProvider(
            useConfirmStripeSetupIntent
        )

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toBe('Stripe not initialized')
        }
    })

    it('should reject if elements is not initialized', async () => {
        const mockConfirmStripe = jest.fn()

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: mockConfirmStripe,
        } as any)

        assumeMock(useElements).mockReturnValue(null)

        assumeMock(useBillingContact).mockReturnValue(
            mockBillingContactResponse as any
        )

        const {result} = renderHookWithQueryClientProvider(
            useConfirmStripeSetupIntent
        )

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toBe('Stripe not initialized')
        }

        expect(mockConfirmStripe).not.toHaveBeenCalled()
    })
})
