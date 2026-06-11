import client from '@repo/api-resources'
import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { useStripe } from '@stripe/react-stripe-js'
import { act, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { setupServer } from 'msw/node'

import { mockConfirmBillingPaymentMethodSetupHandler } from '@gorgias/helpdesk-mocks'

import { SentryTeam } from 'common/const/sentryTeamNames'

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

const mockedServer = new MockAdapter(client)
const confirmBillingPaymentMethodSetupMock =
    mockConfirmBillingPaymentMethodSetupHandler()
const server = setupServer(confirmBillingPaymentMethodSetupMock.handler)

describe('useSubmitPaymentMethodWithBillingContact hook', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        mockedServer.reset()
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should call updateBillingContact and submitPaymentMethod on submit', async () => {
        mockedServer.onPut('/api/billing/contact/').reply(200, {})
        const waitForConfirmRequest =
            confirmBillingPaymentMethodSetupMock.waitForRequest(server)

        const { result } = renderHook(useSubmitPaymentMethodWithBillingContact)

        await act(async () => {
            await result.current.submitPaymentMethodWithBillingContact({
                email: 'test@example.com',
            } as any)
        })

        await waitForConfirmRequest(async (request) => {
            await expect(request.json()).resolves.toEqual({
                id: 'test_setup_intent_id',
            })
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

        const { result } = renderHook(useSubmitPaymentMethodWithBillingContact)

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

        const { result } = renderHook(useSubmitPaymentMethodWithBillingContact)

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
        server.use(
            mockConfirmBillingPaymentMethodSetupHandler(
                () =>
                    new Promise(() => {
                        // Never resolves
                    }),
            ).handler,
        )

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: jest.fn().mockResolvedValue({
                setupIntent: {
                    id: 'test_setup_intent_id',
                },
            }),
        } as any)

        const { result } = renderHook(useSubmitPaymentMethodWithBillingContact)

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
