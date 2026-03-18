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
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

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
            type: ChartType.Card,
            items: [
                {
                    chartId: AnalyticsOverviewChart.AutomationRateCard,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: AnalyticsOverviewChart.AutomatedInteractionsCard,
                    gridSize: 3,
                    visibility: true,
                },
            ],
        },
    ],
}

const mockOverviewDashboard: AnalyticsManagedDashboard = {
    id: 'ai-agent-overview',
    account_id: 1,
    user_id: 2,
    config: {
        id: 'ai-agent-overview',
        tabs: [
            {
                id: ManagedDashboardsTabId.Overview,
                name: 'Main',
                sections: [
                    {
                        section_id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chart_id:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                metadata: { visible: false, grid_size: 3 },
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

const mockAnalyticsDashboard: AnalyticsManagedDashboard = {
    id: 'ai-agent-analytics',
    account_id: 1,
    user_id: 2,
    config: {
        id: 'ai-agent-analytics',
        tabs: [
            {
                id: ManagedDashboardsTabId.AllAgents,
                name: 'All Agents',
                sections: [
                    {
                        section_id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chart_id:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                metadata: { visible: true, grid_size: 6 },
                            },
                        ],
                    },
                ],
            },
            {
                id: ManagedDashboardsTabId.SupportAgent,
                name: 'Support Agent',
                sections: [
                    {
                        section_id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chart_id:
                                    AnalyticsOverviewChart.AutomatedInteractionsCard,
                                metadata: { visible: false, grid_size: 3 },
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
                    tabId: ManagedDashboardsTabId.Overview,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            expect(result.current.layoutConfig).toEqual(mockDefaultLayoutConfig)
        })
    })

    it('should return defaultLayoutConfig when dashboardId does not match any dashboard', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockOverviewDashboard],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: ManagedDashboardId.AiAgentAnalytics,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: ManagedDashboardsTabId.AllAgents,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            expect(result.current.layoutConfig).toEqual(mockDefaultLayoutConfig)
        })
    })

    it('should return merged layoutConfig with saved and default items when dashboard is found', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockOverviewDashboard],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: ManagedDashboardId.AiAgentOverview,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: ManagedDashboardsTabId.Overview,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            const kpisSection = result.current.layoutConfig.sections.find(
                (s) => s.id === 'kpis',
            )
            const kpi = kpisSection?.items.find(
                (i) => i.chartId === AnalyticsOverviewChart.AutomationRateCard,
            )
            expect(kpi).toBeDefined()
            expect(kpi?.visibility).toBe(false)
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
                    tabId: ManagedDashboardsTabId.Overview,
                }),
            { wrapper: makeWrapper() },
        )

        expect(result.current.layoutConfig).toEqual(mockDefaultLayoutConfig)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return layout config for the correct tab when tabId is provided', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockAnalyticsDashboard],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: ManagedDashboardId.AiAgentAnalytics,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: ManagedDashboardsTabId.AllAgents,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            const kpisSection = result.current.layoutConfig.sections.find(
                (s) => s.id === 'kpis',
            )
            const kpi = kpisSection?.items.find(
                (i) => i.chartId === AnalyticsOverviewChart.AutomationRateCard,
            )
            expect(kpi?.gridSize).toBe(6)
        })
    })

    it('should return layout config for the support-agent tab when that tabId is provided', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockAnalyticsDashboard],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: ManagedDashboardId.AiAgentAnalytics,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: ManagedDashboardsTabId.SupportAgent,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            const kpisSection = result.current.layoutConfig.sections.find(
                (s) => s.id === 'kpis',
            )
            const kpi = kpisSection?.items.find(
                (i) =>
                    i.chartId ===
                    AnalyticsOverviewChart.AutomatedInteractionsCard,
            )
            expect(kpi?.visibility).toBe(false)
        })
    })
})
