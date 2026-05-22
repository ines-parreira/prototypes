import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing/vitest'
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockListAnalyticsManagedDashboardsHandler,
    mockListAnalyticsManagedDashboardsResponse,
} from '@gorgias/helpdesk-mocks'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import type { DashboardLayoutConfig } from '../../types'
import { ChartType } from '../../types'
import { useGetManagedDashboardsLayoutConfig } from '../useGetManagedDashboardsLayoutConfig'

const AUTOMATION_RATE_CARD = 'revamp-ai_agent_overview-automation_rate_card'
const AUTOMATED_INTERACTIONS_CARD =
    'revamp-ai_agent_overview-automated_interactions_card'
const PERFORMANCE_TABLE = 'revamp-ai_agent_overview-performance_table'
const ARTICLE_RECOMMENDATION_TABLE =
    'revamp-ai_agent_overview-article_recommendation_table'
const FLOWS_TABLE = 'revamp-ai_agent_overview-flows_table'

const DASHBOARD_OVERVIEW = 'ai-agent-overview'
const DASHBOARD_ANALYTICS = 'ai-agent-analytics'
const TAB_OVERVIEW = 'overview'
const TAB_ALL_AGENTS = 'all-agents'
const TAB_SUPPORT_AGENT = 'support-agent'

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
        defaultOptions: { queries: { retry: false } },
        queryCache: new QueryCache(),
    })
    return ({ children }: { children?: ReactNode }) => (
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
                    chartId: AUTOMATION_RATE_CARD,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: AUTOMATED_INTERACTIONS_CARD,
                    gridSize: 3,
                    visibility: true,
                },
            ],
        },
    ],
}

const mockOverviewDashboard: AnalyticsManagedDashboard = {
    id: DASHBOARD_OVERVIEW,
    account_id: 1,
    user_id: 2,
    config: {
        id: DASHBOARD_OVERVIEW,
        tabs: [
            {
                id: TAB_OVERVIEW,
                name: 'Main',
                sections: [
                    {
                        section_id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chart_id: AUTOMATION_RATE_CARD,
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
    id: DASHBOARD_ANALYTICS,
    account_id: 1,
    user_id: 2,
    config: {
        id: DASHBOARD_ANALYTICS,
        tabs: [
            {
                id: TAB_ALL_AGENTS,
                name: 'All Agents',
                sections: [
                    {
                        section_id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chart_id: AUTOMATION_RATE_CARD,
                                metadata: { visible: true, grid_size: 6 },
                            },
                        ],
                    },
                ],
            },
            {
                id: TAB_SUPPORT_AGENT,
                name: 'Support Agent',
                sections: [
                    {
                        section_id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chart_id: AUTOMATED_INTERACTIONS_CARD,
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

const mockDefaultTableLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'breakdown',
            type: ChartType.Table,
            items: [
                {
                    chartId: PERFORMANCE_TABLE,
                    gridSize: 12,
                    visibility: true,
                },
                {
                    chartId: ARTICLE_RECOMMENDATION_TABLE,
                    gridSize: 12,
                    visibility: false,
                    requiresFeatureFlag: true,
                },
                {
                    chartId: FLOWS_TABLE,
                    gridSize: 12,
                    visibility: false,
                    requiresFeatureFlag: true,
                },
            ],
        },
    ],
}

const mockOverviewDashboardWithSavedTableSubset: AnalyticsManagedDashboard = {
    ...mockOverviewDashboard,
    config: {
        id: DASHBOARD_OVERVIEW,
        tabs: [
            {
                id: TAB_OVERVIEW,
                name: 'Main',
                sections: [
                    {
                        section_id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chart_id: PERFORMANCE_TABLE,
                                metadata: { visible: false, grid_size: 6 },
                            },
                            {
                                chart_id: ARTICLE_RECOMMENDATION_TABLE,
                                metadata: { visible: true, grid_size: 12 },
                            },
                        ],
                    },
                ],
            },
        ],
    },
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
                    dashboardId: DASHBOARD_OVERVIEW,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: TAB_OVERVIEW,
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
                    dashboardId: DASHBOARD_ANALYTICS,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: TAB_ALL_AGENTS,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            expect(result.current.layoutConfig).toEqual(mockDefaultLayoutConfig)
        })
    })

    it('should return merged layoutConfig with saved and default items when dashboard is found', async () => {
        const mockHandler = mockListAnalyticsManagedDashboardsHandler(
            async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockOverviewDashboard],
                    }),
                ),
        )
        server.use(mockHandler.handler)
        const waitForRequest = mockHandler.waitForRequest(server)

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: DASHBOARD_OVERVIEW,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: TAB_OVERVIEW,
                }),
            { wrapper: makeWrapper() },
        )

        await waitForRequest()

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        const kpisSection = result.current.layoutConfig.sections.find(
            (s) => s.id === 'kpis',
        )
        const kpi = kpisSection?.items.find(
            (i) => i.chartId === AUTOMATION_RATE_CARD,
        )
        expect(kpi).toBeDefined()
        expect(kpi?.visibility).toBe(false)
    })

    it('should merge saved table items with newer local default table items while keeping saved values', async () => {
        server.use(
            mockListAnalyticsManagedDashboardsHandler(async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockOverviewDashboardWithSavedTableSubset],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: DASHBOARD_OVERVIEW,
                    defaultLayoutConfig: mockDefaultTableLayoutConfig,
                    tabId: TAB_OVERVIEW,
                }),
            { wrapper: makeWrapper() },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.layoutConfig.sections).toEqual([
            {
                id: 'breakdown',
                type: ChartType.Table,
                items: [
                    {
                        chartId: PERFORMANCE_TABLE,
                        gridSize: 6,
                        visibility: false,
                        measures: undefined,
                        dimensions: undefined,
                        requiresFeatureFlag: undefined,
                    },
                    {
                        chartId: ARTICLE_RECOMMENDATION_TABLE,
                        gridSize: 12,
                        visibility: true,
                        measures: undefined,
                        dimensions: undefined,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId: FLOWS_TABLE,
                        gridSize: 12,
                        visibility: false,
                        requiresFeatureFlag: true,
                    },
                ],
            },
        ])
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
                    dashboardId: DASHBOARD_OVERVIEW,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: TAB_OVERVIEW,
                }),
            { wrapper: makeWrapper() },
        )

        expect(result.current.layoutConfig).toEqual(mockDefaultLayoutConfig)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return layout config for the correct tab when tabId is provided', async () => {
        const mockHandler = mockListAnalyticsManagedDashboardsHandler(
            async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockAnalyticsDashboard],
                    }),
                ),
        )
        server.use(mockHandler.handler)
        const waitForRequest = mockHandler.waitForRequest(server)

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: DASHBOARD_ANALYTICS,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: TAB_ALL_AGENTS,
                }),
            { wrapper: makeWrapper() },
        )

        await waitForRequest()

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        await waitFor(() => {
            const kpisSection = result.current.layoutConfig.sections.find(
                (s) => s.id === 'kpis',
            )
            const kpi = kpisSection?.items.find(
                (i) => i.chartId === AUTOMATION_RATE_CARD,
            )
            expect(kpi?.gridSize).toBe(6)
        })
    })

    it('should return layout config for the support-agent tab when that tabId is provided', async () => {
        const mockHandler = mockListAnalyticsManagedDashboardsHandler(
            async () =>
                HttpResponse.json(
                    mockListAnalyticsManagedDashboardsResponse({
                        data: [mockAnalyticsDashboard],
                    }),
                ),
        )
        server.use(mockHandler.handler)
        const waitForRequest = mockHandler.waitForRequest(server)

        const { result } = renderHook(
            () =>
                useGetManagedDashboardsLayoutConfig({
                    dashboardId: DASHBOARD_ANALYTICS,
                    defaultLayoutConfig: mockDefaultLayoutConfig,
                    tabId: TAB_SUPPORT_AGENT,
                }),
            { wrapper: makeWrapper() },
        )

        await waitForRequest()

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        const kpisSection = result.current.layoutConfig.sections.find(
            (s) => s.id === 'kpis',
        )
        const kpi = kpisSection?.items.find(
            (i) => i.chartId === AUTOMATED_INTERACTIONS_CARD,
        )
        expect(kpi?.visibility).toBe(false)
    })
})
