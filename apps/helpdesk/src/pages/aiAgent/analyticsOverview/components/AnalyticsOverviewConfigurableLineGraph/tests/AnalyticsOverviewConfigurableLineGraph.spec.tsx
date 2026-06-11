import { useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAnalyticsManagedDashboardsHandler,
    mockListStoresResponse,
    mockUpdateAnalyticsManagedDashboardHandler,
} from '@gorgias/helpdesk-mocks'

import { ReportingGranularity } from 'domains/reporting/models/types'
import * as aiAgentStatsFiltersHooks from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { getLineChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { AnalyticsOverviewConfigurableLineGraph } from '../AnalyticsOverviewConfigurableLineGraph'

jest.mock('@repo/feature-flags')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getLineChartGraphConfig: jest.fn(),
}))
const getLineChartGraphConfigMock = assumeMock(getLineChartGraphConfig)

const useFlagWithLoadingMocked = assumeMock(useFlagWithLoading)

const server = setupServer(
    http.get('/api/reporting/stores', async () =>
        HttpResponse.json(mockListStoresResponse({ data: [] })),
    ),
    mockListAnalyticsManagedDashboardsHandler().handler,
    mockUpdateAnalyticsManagedDashboardHandler().handler,
)

describe('AnalyticsOverviewConfigurableLineGraph', () => {
    const mockTimeSeriesData = [
        { date: 'Jun 1 2024', value: 0.3 },
        { date: 'Jun 2 2024', value: 0.28 },
        { date: 'Jun 3 2024', value: 0.32 },
    ]

    const defaultDimension = {
        id: 'overall',
        name: 'Overall',
        configurableGraphType: ConfigurableGraphType.TimeSeries,
        useChartData: jest.fn().mockReturnValue({
            data: mockTimeSeriesData,
            isLoading: false,
        }),
    }

    const defaultMetricConfig: ConfigurableGraphMetricConfig = {
        measure: 'automationRate',
        name: 'Overall automation rate',
        metricFormat: 'decimal-to-percent',
        interpretAs: 'more-is-better',
        dimensions: [defaultDimension],
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }

        Element.prototype.getAnimations = function () {
            return []
        }
    })

    beforeEach(() => {
        jest.spyOn(
            aiAgentStatsFiltersHooks,
            'useAiAgentStatsFilters',
        ).mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-06-01',
                    end_datetime: '2024-06-07',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        getLineChartGraphConfigMock.mockReturnValue([defaultMetricConfig])
        useFlagWithLoadingMocked.mockReturnValue({
            value: true,
            isLoading: false,
        })
    })

    afterEach(() => {
        server.resetHandlers()
        jest.clearAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    it('should render the metric title', () => {
        render(<AnalyticsOverviewConfigurableLineGraph />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should not render a trend badge', () => {
        const { container } = render(<AnalyticsOverviewConfigurableLineGraph />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(false)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<AnalyticsOverviewConfigurableLineGraph />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should pass stores from useListStores to getLineChartGraphConfig', async () => {
        const mockStores = [
            {
                store_integration_id: 123,
                name: 'my-store',
                created_datetime: '2025-01-01T00:00:00Z',
            },
        ]
        server.use(
            http.get('/api/reporting/stores', async () =>
                HttpResponse.json(mockListStoresResponse({ data: mockStores })),
            ),
        )

        render(<AnalyticsOverviewConfigurableLineGraph />)

        await waitFor(() => {
            expect(getLineChartGraphConfigMock).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                { stores: mockStores },
            )
        })
    })
})
