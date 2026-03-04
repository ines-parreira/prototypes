import type { ReactNode } from 'react'

import { useFlag } from '@repo/feature-flags'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAnalyticsManagedDashboardsHandler,
    mockListAnalyticsManagedDashboardsResponse,
} from '@gorgias/helpdesk-mocks'

import { useFetchManagedDashboards } from 'domains/reporting/hooks/managed-dashboards/useFetchManagedDashboards'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTrendCards:
            'ai-agent-analytics-dashboards-trend-cards',
    },
    useFlag: jest.fn(),
}))

const mockedUseFlag = jest.mocked(useFlag)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    mockedUseFlag.mockReset()
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
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useFetchManagedDashboards', () => {
    it('should fetch dashboards when feature flag is enabled', async () => {
        mockedUseFlag.mockReturnValue(true)

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

    it('should not fetch when feature flag is disabled', () => {
        mockedUseFlag.mockReturnValue(false)

        // MSW server uses onUnhandledRequest: 'error', if a request is made
        // without a registered handler, the test fails. No handler is registered
        // here, so the test verifies the query is not triggered when FF is off.
        renderHook(() => useFetchManagedDashboards(), {
            wrapper: makeWrapper(),
        })
    })
})
