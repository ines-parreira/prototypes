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

import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { ManagedDashboardId } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTrendCards:
            'ai-agent-analytics-dashboards-trend-cards',
    },
    useFlag: jest.fn().mockReturnValue(true),
}))

const mockedUseFlag = jest.mocked(useFlag)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    mockedUseFlag.mockReset()
    mockedUseFlag.mockReturnValue(true)
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

const mockDefaultLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'kpis',
            type: 'kpis',
            items: [
                {
                    chartId: 'default-kpi' as any,
                    gridSize: 3,
                    visibility: true,
                },
            ],
        },
    ],
}

const mockDashboard: AnalyticsManagedDashboard = {
    id: 'ai-agent-overview',
    account_id: 1,
    user_id: 2,
    config: {
        id: 'ai-agent-overview',
        tabs: [
            {
                id: 'tab_main',
                name: 'Main',
                sections: [
                    {
                        section_id: 'kpis',
                        type: 'card',
                        items: [
                            {
                                chart_id: 'saved-kpi',
                                metadata: { visible: true, grid_size: 3 },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    created_datetime: '2026-02-18T00:00:00Z',
    updated_datetime: '2026-02-18T00:00:00Z',
}

describe('useGetManagedDashboardsLayoutConfig', () => {
    it('should return defaultLayoutConfig when no matching dashboard in response', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({ data: [] }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: ManagedDashboardId.AiAgentOverview,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            expect(result.current).toEqual(mockDefaultLayoutConfig)
        })
    })

    it('should return defaultLayoutConfig when dashboardId does not match any dashboard', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockDashboard],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: ManagedDashboardId.AiAgentAllAgents,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            expect(result.current).toEqual(mockDefaultLayoutConfig)
        })
    })

    it('should return merged layoutConfig with saved and default items when dashboard is found', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockDashboard],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: ManagedDashboardId.AiAgentOverview,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            const kpisSection = result.current.sections.find(
                (s) => s.id === 'kpis',
            )
            expect(
                kpisSection?.items.some(
                    (i) => i.chartId === ('saved-kpi' as any),
                ),
            ).toBe(true)
            expect(
                kpisSection?.items.some(
                    (i) => i.chartId === ('default-kpi' as any),
                ),
            ).toBe(true)
        })
    })

    it('should return defaultLayoutConfig while data is loading', () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () => {
                await new Promise(() => {})
                return HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse(),
                )
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: ManagedDashboardId.AiAgentOverview,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        expect(result.current).toEqual(mockDefaultLayoutConfig)
    })
})
