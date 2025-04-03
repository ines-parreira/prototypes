import { useStripe } from '@stripe/react-stripe-js'
import { act } from '@testing-library/react-hooks'
import MockAdapter from 'axios-mock-adapter'

import { confirmBillingPaymentMethodSetup } from '@gorgias/api-client'

import { SentryTeam } from 'common/const/sentryTeamNames'
import client from 'models/api/resources'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { reportError } from 'utils/errors'
import { assumeMock } from 'utils/testing'

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

jest.mock('utils/errors')

jest.mock('@gorgias/api-client')

const mockedServer = new MockAdapter(client)

describe('useSubmitPaymentMethodWithBillingContact hook', () => {
    it('should call updateBillingContact and submitPaymentMethod on submit', async () => {
        mockedServer.onPut('/api/billing/contact/').reply(200, {})

        const { result, waitFor } = renderHookWithStoreAndQueryClientProvider(
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

        expect(reportError).toHaveBeenLastCalledWith(error, {
            tags: { team: SentryTeam.CRM_GROWTH },
            extra: { context: 'Failed to update billing contact' },
        })
    })

    it('should return isLoading as true if updateBillingContact mutation is loading', async () => {
        mockedServer.onPut('/api/billing/contact/').reply(
            () =>
                new Promise(() => {
                    // Never resolves
                }),
        )

        const { result, waitFor } = renderHookWithStoreAndQueryClientProvider(
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

        const { result, waitFor } = renderHookWithStoreAndQueryClientProvider(
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
