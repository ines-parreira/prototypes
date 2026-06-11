import client from '@repo/api-resources'
import { assumeMock, renderHook } from '@repo/testing'
import { useStripe } from '@stripe/react-stripe-js'
import { act, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockConfirmBillingPaymentMethodSetupHandler } from '@gorgias/helpdesk-mocks'

import { billingContact } from 'fixtures/resources'

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

const confirmBillingPaymentMethodSetupMock =
    mockConfirmBillingPaymentMethodSetupHandler()

const mockedServer = new MockAdapter(client)
const server = setupServer(confirmBillingPaymentMethodSetupMock.handler)

describe('useSubmitPaymentMethod hook', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        mockedServer.onGet('/api/billing/contact/').reply(200, billingContact)
        mockedServer.onPut('/api/billing/subscription/start/').reply(200, {
            subscription: {},
            payment: {},
        })
        assumeMock(useStripe).mockReturnValue({
            confirmSetup: jest.fn().mockResolvedValue({
                setupIntent: {
                    id: 'test_setup_intent_id',
                },
            }),
        } as any)
    })

    afterEach(() => {
        mockedServer.reset()
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should call confirmBillingPaymentMethodSetup on submit', async () => {
        const waitForConfirmRequest =
            confirmBillingPaymentMethodSetupMock.waitForRequest(server)
        const { result } = renderHook(useSubmitPaymentMethod)

        await act(async () => {
            await result.current.submitPaymentMethod()
        })

        await waitForConfirmRequest(async (request) => {
            await expect(request.json()).resolves.toEqual({
                id: 'test_setup_intent_id',
            })
        })
    })

    it('should throw error when confirmStripeSetupIntent fails', async () => {
        const error = new Error('Stripe setup intent failed')

        assumeMock(useStripe).mockReturnValue({
            confirmSetup: jest.fn().mockRejectedValue(error),
        } as any)

        const { result } = renderHook(useSubmitPaymentMethod)

        await expect(result.current.submitPaymentMethod()).rejects.toThrow(
            'Stripe setup intent failed',
        )
    })

    it('should throw error when confirmBillingPaymentMethodSetup fails', async () => {
        server.use(
            mockConfirmBillingPaymentMethodSetupHandler(async () =>
                HttpResponse.json(
                    {
                        error: {
                            msg: 'Billing payment method setup failed',
                        },
                    } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(useSubmitPaymentMethod)

        await expect(result.current.submitPaymentMethod()).rejects.toBeDefined()
    })

    it('should return isLoading as true if the useConfirmStripeSetupIntent mutation is loading', async () => {
        assumeMock(useStripe).mockReturnValue({
            confirmSetup: jest.fn().mockResolvedValue(
                new Promise(() => {
                    // Never resolves
                }),
            ),
        } as any)

        const { result } = renderHook(useSubmitPaymentMethod)

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

        server.use(
            mockConfirmBillingPaymentMethodSetupHandler(
                () =>
                    new Promise((resolve) => {
                        resolveConfirmBillingPaymentMethodSetup = () =>
                            resolve(new HttpResponse(null, { status: 200 }))
                    }),
            ).handler,
        )

        const { result } = renderHook(useSubmitPaymentMethod)

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
