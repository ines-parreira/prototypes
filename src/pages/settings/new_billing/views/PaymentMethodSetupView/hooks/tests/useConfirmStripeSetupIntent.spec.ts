import {useElements, useStripe} from '@stripe/react-stripe-js'
import {waitFor} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import * as queries from 'models/billing/queries'
import {renderHookWithStoreAndQueryClientProvider} from 'tests/renderHookWithStoreAndQueryClientProvider'
import * as errorUtils from 'utils/errors'
import {assumeMock} from 'utils/testing'

import {useConfirmStripeSetupIntent} from '../useConfirmStripeSetupIntent'

jest.mock('@stripe/react-stripe-js')

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

const mockedServer = new MockAdapter(client)

const mockBillingContactResponse = {
    data: {
        shipping: mockShipping,
        email: 'test@example.com',
    },
}

mockedServer
    .onGet('/api/billing/contact/')
    .reply(200, mockBillingContactResponse)

describe('useConfirmStripeSetupIntent', () => {
    it('should call stripe.confirmSetup with correct params', async () => {
        jest.spyOn(queries, 'useBillingContact').mockReturnValue({
            data: mockBillingContactResponse,
            isLoading: false,
        } as any)

        const mockConfirmStripe = jest.fn()

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: mockConfirmStripe,
        } as any)

        assumeMock(useElements).mockReturnValue('mockElements' as any)

        const {result} = renderHookWithStoreAndQueryClientProvider(
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

        const {result} = renderHookWithStoreAndQueryClientProvider(
            useConfirmStripeSetupIntent
        )

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual(new Error('Stripe is not initialized'))
        }
    })

    it('should reject if elements is not initialized', async () => {
        const mockConfirmStripe = jest.fn()

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: mockConfirmStripe,
        } as any)

        assumeMock(useElements).mockReturnValue(null)

        const {result} = renderHookWithStoreAndQueryClientProvider(
            useConfirmStripeSetupIntent
        )

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual(new Error('Stripe is not initialized'))
        }

        expect(mockConfirmStripe).not.toHaveBeenCalled()
    })

    it('should not call sentry if the card is declined', async () => {
        const reportErrorSpy = jest.spyOn(errorUtils, 'reportError')

        const mockConfirmStripe = jest.fn().mockResolvedValue({
            error: {
                code: 'card_declined',
            },
        })

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: mockConfirmStripe,
        } as any)

        assumeMock(useElements).mockReturnValue({} as any)

        const {result} = renderHookWithStoreAndQueryClientProvider(
            useConfirmStripeSetupIntent
        )

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual({
                code: 'card_declined',
            })
        }

        expect(reportErrorSpy).not.toHaveBeenCalled()
    })

    it('should call sentry in case of an error that is not card_declined', async () => {
        const reportErrorSpy = jest.spyOn(errorUtils, 'reportError')

        const mockConfirmStripe = jest.fn().mockRejectedValue({
            code: 'some_error',
        })

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: mockConfirmStripe,
        } as any)

        assumeMock(useElements).mockReturnValue({} as any)

        const {result} = renderHookWithStoreAndQueryClientProvider(
            useConfirmStripeSetupIntent
        )

        try {
            await act(async () => {
                await result.current.mutateAsync([])
            })
        } catch (e) {
            expect(e).toEqual({
                code: 'some_error',
            })
        }

        expect(reportErrorSpy).toHaveBeenCalled()
    })

    it("should return setupIntent if the setup intent is successful, even when there's an error", async () => {
        const mockConfirmStripe = jest.fn().mockResolvedValue({
            error: {
                setup_intent: {
                    status: 'succeeded',
                },
            },
        })

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: mockConfirmStripe,
        } as any)

        assumeMock(useElements).mockReturnValue({} as any)

        const {result} = renderHookWithStoreAndQueryClientProvider(
            useConfirmStripeSetupIntent
        )

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
