import { reportError } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { useStripe } from '@stripe/react-stripe-js'
import { act, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { confirmBillingPaymentMethodSetup } from '@gorgias/helpdesk-client'

import { SentryTeam } from 'common/const/sentryTeamNames'
import client from 'models/api/resources'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

import { useSubmitPaymentMethodWithBillingContact } from '../useSubmitPaymentMethodWithBillingContact'

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

jest.mock('@repo/logging')

jest.mock('@gorgias/helpdesk-client')

const mockedServer = new MockAdapter(client)

describe('useSubmitPaymentMethodWithBillingContact hook', () => {
    it('should call updateBillingContact and submitPaymentMethod on submit', async () => {
        mockedServer.onPut('/api/billing/contact/').reply(200, {})

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethodWithBillingContact,
        )

        await act(async () => {
            await result.current.submitPaymentMethodWithBillingContact({
                email: 'test@example.com',
            } as any)
        })

        await waitFor(() => {
            expect(
                assumeMock(confirmBillingPaymentMethodSetup),
            ).toHaveBeenCalledWith({ id: 'test_setup_intent_id' }, undefined)
        })

        expect(mockedServer.history.put[0].data).toEqual(
            JSON.stringify({
                email: 'test@example.com',
            }),
        )
    })

    it('should handle error when updateBillingContact fails', async () => {
        const error = new Error('Update billing contact failed')

        mockedServer.onPut('/api/billing/contact/').reply(() => {
            throw error
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethodWithBillingContact,
        )

        await act(async () => {
            await expect(
                result.current.submitPaymentMethodWithBillingContact({
                    email: 'test@example.com',
                } as any),
            ).rejects.toThrow('Update billing contact failed')
        })

        expect(reportError).toHaveBeenLastCalledWith(
            expect.objectContaining({
                message:
                    'Failed to update billing contact: Update billing contact failed',
            }),
            {
                tags: { team: SentryTeam.CRM_GROWTH },
                extra: {
                    context: 'Failed to update billing contact',
                    originalError: error,
                },
            },
        )
    })

    it('should return isLoading as true if updateBillingContact mutation is loading', async () => {
        mockedServer.onPut('/api/billing/contact/').reply(
            () =>
                new Promise(() => {
                    // Never resolves
                }),
        )

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethodWithBillingContact,
        )

        expect(result.current.isLoading).toBe(false)

        act(() => {
            void result.current.submitPaymentMethodWithBillingContact({
                email: 'test@example.com',
            } as any)
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true)
        })
    })

    it('should return isLoading as true if submitPaymentMethod is loading', async () => {
        mockedServer.onPut('/api/billing/contact/').reply(200, {})

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: jest.fn().mockResolvedValue(new Promise(() => {})),
        } as any)

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useSubmitPaymentMethodWithBillingContact,
        )

        expect(result.current.isLoading).toBe(false)

        act(() => {
            void result.current.submitPaymentMethodWithBillingContact({
                email: 'test@example.com',
            } as any)
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true)
        })
    })
})
