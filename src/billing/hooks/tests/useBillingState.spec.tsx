import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetBillingStateHandler } from '@gorgias/helpdesk-mocks'
import { BillingState } from '@gorgias/helpdesk-queries'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { useBillingState } from '../useBillingState'

const server = setupServer()
const queryClient = mockQueryClient()

beforeAll(() => server.listen())
afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})
afterAll(() => server.close())

const renderBillingStateHook = () => {
    return renderHook(() => useBillingState(), {
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    })
}

describe('useBillingState()', () => {
    it('should return the billing state if the request succeeds', async () => {
        const getStateMock = mockGetBillingStateHandler()
        server.use(getStateMock.handler)

        const { result } = renderBillingStateHook()

        await waitFor(() => {
            expect(result.current).toEqual(getStateMock.data)
        })
    })

    it('should return undefined while the request is loading', async () => {
        jest.useFakeTimers()
        const getStateMock = mockGetBillingStateHandler(async ({ data }) => {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return HttpResponse.json(data)
        })

        server.use(getStateMock.handler)

        const { result } = renderBillingStateHook()
        expect(result.current).toBeUndefined()

        jest.useRealTimers()
    })

    it('should return undefined if the request fails', async () => {
        const getStateMock = mockGetBillingStateHandler(async () => {
            return HttpResponse.json(
                { error: { msg: 'Server error' } } as unknown as BillingState,
                { status: 500 },
            )
        })

        server.use(getStateMock.handler)

        const { result } = renderBillingStateHook()

        expect(result.current).toBeUndefined()
    })
})
