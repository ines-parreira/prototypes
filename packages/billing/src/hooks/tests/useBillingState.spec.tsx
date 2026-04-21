import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { delay, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import {
    mockBillingState,
    mockCreditCard,
    mockCustomerSummary,
    mockGetBillingStateHandler,
} from '@gorgias/helpdesk-mocks'

import { useBillingState } from '../useBillingState'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useBillingState()', () => {
    it('should return the billing state if the request succeeds', async () => {
        const billingState = mockBillingState({
            customer: mockCustomerSummary({
                credit_card: mockCreditCard(),
            }),
        })
        const mockGetBillingState = mockGetBillingStateHandler(async () =>
            HttpResponse.json(billingState),
        )

        server.use(mockGetBillingState.handler)

        const { result } = renderHook(() => useBillingState())

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data).toEqual(billingState)
    })

    it('should return isFetching as true while the request is loading', async () => {
        const billingState = mockBillingState()
        let releaseResponse!: () => void

        const pendingResponse = new Promise<void>((resolve) => {
            releaseResponse = resolve
        })

        const mockGetBillingState = mockGetBillingStateHandler(async () => {
            await pendingResponse
            return HttpResponse.json(billingState)
        })

        server.use(mockGetBillingState.handler)

        const { result } = renderHook(() => useBillingState())

        await waitFor(() => {
            expect(result.current.isFetching).toBe(true)
        })

        expect(result.current.data).toBeUndefined()

        releaseResponse()

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })

    it('should return undefined if the request fails', async () => {
        const mockGetBillingState = mockGetBillingStateHandler(async () => {
            await delay(20)

            return HttpResponse.json(mockBillingState(), { status: 500 })
        })

        server.use(mockGetBillingState.handler)

        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        try {
            const { result } = renderHook(() => useBillingState())

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            expect(result.current.data).toBeUndefined()
        } finally {
            consoleErrorSpy.mockRestore()
        }
    })
})
