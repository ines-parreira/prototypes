import { useStripe } from '@stripe/react-stripe-js'
import { act, waitFor } from '@testing-library/react'

import { confirmBillingPaymentMethodSetup } from '@gorgias/api-client'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { reportError } from 'utils/errors'
import { assumeMock } from 'utils/testing'

import { useSubmitPaymentMethod } from '../useSubmitPaymentMethod'

jest.mock('@stripe/react-stripe-js', () => ({
    useElements: jest.fn().mockReturnValue({}),
    useStripe: jest.fn().mockReturnValue({
        confirmSetup: jest.fn().mockResolvedValue({
            setupIntent: {
                id: 'test_setup_intent_id',
            },
        }),
    }),
}))

jest.mock('utils/errors')

jest.mock('@gorgias/api-client')

describe('useSubmitPaymentMethod hook', () => {
    beforeEach(() => {
        assumeMock(useStripe).mockReturnValue({
            confirmSetup: jest.fn().mockResolvedValue({
                setupIntent: {
                    id: 'test_setup_intent_id',
                },
            }),
        } as any)
    })

    it('should call confirmBillingPaymentMethodSetup on submit', async () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethod,
        )

        await act(async () => {
            await result.current.submitPaymentMethod()
        })

        await waitFor(() => {
            expect(
                assumeMock(confirmBillingPaymentMethodSetup),
            ).toHaveBeenCalledWith({ id: 'test_setup_intent_id' }, undefined)
        })
    })

    it('should handle error when confirmStripeSetupIntent fails', async () => {
        const error = new Error('Stripe setup intent failed')

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: jest.fn().mockRejectedValue(error),
        } as any)

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethod,
        )

        await expect(result.current.submitPaymentMethod()).rejects.toThrow(
            'Stripe setup intent failed',
        )

        expect(reportError).toHaveBeenLastCalledWith(error, {
            tags: { team: SentryTeam.CRM_GROWTH },
            extra: { context: 'Failed to confirm stripe setup intent' },
        })
    })

    it('should handle error when confirmBillingPaymentMethodSetup fails', async () => {
        const error = new Error('Billing payment method setup failed')

        assumeMock(confirmBillingPaymentMethodSetup).mockRejectedValue(error)

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethod,
        )

        await expect(result.current.submitPaymentMethod()).rejects.toThrow(
            'Billing payment method setup failed',
        )

        expect(reportError).toHaveBeenLastCalledWith(error, {
            tags: { team: SentryTeam.CRM_GROWTH },
            extra: { context: 'Failed to confirm stripe setup intent' },
        })
    })

    it('should return isLoading as true if the useConfirmStripeSetupIntent mutation is loading', async () => {
        assumeMock(useStripe).mockReturnValue({
            confirmSetup: jest.fn().mockResolvedValue(
                new Promise(() => {
                    // Never resolves
                }),
            ),
        } as any)

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethod,
        )

        expect(result.current.isLoading).toBe(false)

        act(() => {
            void result.current.submitPaymentMethod()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true)
        })
    })

    it('should return isLoading as true if the confirmBillingPaymentMethodSetup mutation is loading', async () => {
        let resolveConfirmBillingPaymentMethodSetup: () => void

        assumeMock(confirmBillingPaymentMethodSetup).mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveConfirmBillingPaymentMethodSetup = () =>
                        resolve({} as any)
                }),
        )

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethod,
        )

        expect(result.current.isLoading).toBe(false)

        act(() => {
            void result.current.submitPaymentMethod()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true)
            expect(resolveConfirmBillingPaymentMethodSetup).toBeDefined()
        })

        act(() => {
            resolveConfirmBillingPaymentMethodSetup()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })
})
