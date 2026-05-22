import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'

import {
    mockListAnalyticsManagedDashboardsHandler,
    mockListAnalyticsManagedDashboardsResponse,
} from '@gorgias/helpdesk-mocks'

import { useFetchManagedDashboards } from '../useFetchManagedDashboards'

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

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    return ({ children }: { children?: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useFetchManagedDashboards', () => {
    it('fetches dashboards when enabled is true (default)', async () => {
        const mockHandler = mockListAnalyticsManagedDashboardsHandler(
            async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({ data: [] }),
                ),
        )
        server.use(mockHandler.handler)

        const waitForRequest = mockHandler.waitForRequest(server)

        renderHook(() => useFetchManagedDashboards(), {
            wrapper: makeWrapper(),
        })

        await waitForRequest()
    })

    it('does not fetch when enabled is false', () => {
        // MSW server uses onUnhandledRequest: 'error', if a request is made
        // without a registered handler the test fails. No handler is registered
        // here, so this verifies the query is not triggered when enabled=false.
        renderHook(() => useFetchManagedDashboards({ enabled: false }), {
            wrapper: makeWrapper(),
        })
    })
})
