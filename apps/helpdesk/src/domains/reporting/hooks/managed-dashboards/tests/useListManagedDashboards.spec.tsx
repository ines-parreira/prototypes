import type { ReactNode } from 'react'

import { useFlag } from '@repo/feature-flags'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAnalyticsManagedDashboardsHandler,
    mockListAnalyticsManagedDashboardsResponse,
} from '@gorgias/helpdesk-mocks'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import { useListManagedDashboards } from 'domains/reporting/hooks/managed-dashboards/useListManagedDashboards'

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

const mockDashboard: AnalyticsManagedDashboard = {
    id: 'ai-agent-overview',
    account_id: 1,
    user_id: 2,
    config: {
        id: 'ai-agent-overview',
        tabs: [],
    },
    created_datetime: '2026-02-18T00:00:00Z',
    updated_datetime: '2026-02-18T00:00:00Z',
}

describe('useListManagedDashboards', () => {
    beforeEach(() => {
        mockedUseFlag.mockReturnValue(true)
    })

    afterEach(() => {
        mockedUseFlag.mockReset()
    })

    it('should return empty array initially while loading', () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () => {
                await new Promise(() => {})
                return HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse(),
                )
            }).handler,
        )

        const { result } = renderHook(() => useListManagedDashboards(), {
            wrapper: makeWrapper(),
        })

        expect(result.current.data).toEqual([])
    })

    it('should return the dashboards array when data is loaded', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockDashboard],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useListManagedDashboards(), {
            wrapper: makeWrapper(),
        })

        await waitFor(() => {
            expect(result.current.data).toEqual([mockDashboard])
        })
    })

    it('should return empty array when data contains no dashboards', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({ data: [] }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useListManagedDashboards(), {
            wrapper: makeWrapper(),
        })

        await waitFor(() => {
            expect(result.current.data).toEqual([])
        })
    })

    it('should not fetch when enabled is false', () => {
        // MSW server uses onUnhandledRequest: 'error', if a request is made
        // without a registered handler, the test fails. No handler is registered
        // here, so the test verifies the query is not triggered.
        const { result } = renderHook(
            () => useListManagedDashboards({ enabled: false }),
            { wrapper: makeWrapper() },
        )

        expect(result.current.data).toEqual([])
    })

    it('should not fetch when feature flag is disabled', () => {
        // MSW server uses onUnhandledRequest: 'error', if a request is made
        // without a registered handler, the test fails. No handler is registered
        // here, so the test verifies the query is not triggered when FF is off.
        mockedUseFlag.mockReturnValue(false)

        const { result } = renderHook(() => useListManagedDashboards(), {
            wrapper: makeWrapper(),
        })

        expect(result.current.data).toEqual([])
    })
})
