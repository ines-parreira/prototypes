import client from '@repo/api-resources'
import { assumeMock, renderHook } from '@repo/testing'
import { useElements, useStripe } from '@stripe/react-stripe-js'
import { act, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { toast } from '@gorgias/axiom'

import { billingContact } from 'fixtures/resources'
import * as queries from 'models/billing/queries'

import { useConfirmStripeSetupIntent } from '../useConfirmStripeSetupIntent'

jest.mock('@stripe/react-stripe-js')

const mockedServer = new MockAdapter(client)

const mockBillingContactResponse = {
    data: billingContact,
}

mockedServer
    .onGet('/api/billing/contact/')
    .reply(200, mockBillingContactResponse)

describe('useConfirmStripeSetupIntent', () => {
    let mockConfirmStripe: jest.Mock

    beforeEach(() => {
        assumeMock(useElements).mockReturnValue({} as any)

        mockConfirmStripe = jest.fn()

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: mockConfirmStripe,
        } as any)
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should call stripe.confirmSetup with correct params', async () => {
        jest.spyOn(queries, 'useBillingContact').mockReturnValue({
            data: mockBillingContactResponse,
            isLoading: false,
        } as any)

        const { result } = renderHook(useConfirmStripeSetupIntent)

        act(() => {
            result.current.mutate([])
        })

        await waitFor(() => {
            expect(mockConfirmStripe).toHaveBeenCalledWith({
                elements: {},
                redirect: 'if_required',
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            ...billingContact.shipping,
                            email: billingContact.email,
                        },
                    },
                },
            })
        })
    })

    it('should reject if stripe is not initialized', async () => {
        assumeMock(useStripe).mockReturnValue(null)

        const { result } = renderHook(useConfirmStripeSetupIntent)

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual(new Error('Stripe is not initialized'))
        }
    })

    it('should reject if elements is not initialized', async () => {
        assumeMock(useElements).mockReturnValue(null)

        const { result } = renderHook(useConfirmStripeSetupIntent)

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual(new Error('Stripe is not initialized'))
        }

        expect(mockConfirmStripe).not.toHaveBeenCalled()
    })

    it('should throw error if the card is declined', async () => {
        mockConfirmStripe.mockResolvedValue({
            error: {
                code: 'card_declined',
            },
        })

        const { result } = renderHook(useConfirmStripeSetupIntent)

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual({
                code: 'card_declined',
            })
        }
    })

    it('should throw error in case of any Stripe error', async () => {
        mockConfirmStripe.mockRejectedValue({
            code: 'some_error',
        })

        const { result } = renderHook(useConfirmStripeSetupIntent)

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual({
                code: 'some_error',
            })
        }
    })

    it('should notify users with error message from Stripe when the error type is card_error or validation_error', async () => {
        mockConfirmStripe.mockRejectedValue({
            type: 'card_error',
            message: 'Card error message',
        })

        const { result } = renderHook(useConfirmStripeSetupIntent)

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual({
                type: 'card_error',
                message: 'Card error message',
            })
        }

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Card error message' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should notify users with the default error message when the Stripe error type is NOT card_error or validation_error', async () => {
        mockConfirmStripe.mockRejectedValue({
            type: 'invalid_request_error',
            message: 'Invalid request error message',
        })

        const { result } = renderHook(useConfirmStripeSetupIntent)

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual({
                type: 'invalid_request_error',
                message: 'Invalid request error message',
            })
        }

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Something went wrong unexpectedly. Please try again later, and contact support if the issue persists.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it("should return setupIntent if the setup intent is successful, even when there's an error", async () => {
        mockConfirmStripe.mockResolvedValue({
            error: {
                setup_intent: {
                    status: 'succeeded',
                },
            },
        })

        const { result } = renderHook(useConfirmStripeSetupIntent)

        act(() => {
            result.current.mutate([])
        })

        await waitFor(() => {
            expect(result.current.data).toEqual({
                setupIntent: {
                    status: 'succeeded',
                },
            })
        })
    })
})
