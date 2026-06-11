import { useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAnalyticsManagedDashboardsHandler,
    mockListStoresResponse,
    mockUpdateAnalyticsManagedDashboardHandler,
} from '@gorgias/helpdesk-mocks'

import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getBarChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { AnalyticsShoppingAssistantConfigurableBar } from '../AnalyticsShoppingAssistantConfigurableBar'

jest.mock('@repo/feature-flags')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getBarChartGraphConfig: jest.fn(),
}))
const getBarChartGraphConfigMock = assumeMock(getBarChartGraphConfig)
const useFlagWithLoadingMocked = assumeMock(useFlagWithLoading)

const server = setupServer(
    http.get('/api/reporting/stores', async () =>
        HttpResponse.json(mockListStoresResponse({ data: [] })),
    ),
    mockListAnalyticsManagedDashboardsHandler().handler,
    mockUpdateAnalyticsManagedDashboardHandler().handler,
)

describe('AnalyticsShoppingAssistantConfigurableBar', () => {
    const mockChartData = [
        { name: 'Email', value: 5000 },
        { name: 'Chat', value: 3000 },
        { name: 'SMS', value: 1500 },
    ]

    const defaultDimension = {
        id: 'channel',
        name: 'Channel',
        configurableGraphType: ConfigurableGraphType.Donut,
        useChartData: jest.fn().mockReturnValue({
            data: mockChartData,
            isLoading: false,
        }),
    }

    const defaultMetricConfig: ConfigurableGraphMetricConfig = {
        measure: 'totalSalesAmount',
        name: 'Revenue influenced',
        metricFormat: 'decimal',
        interpretAs: 'more-is-better',
        useTrendData: jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 9500, prevValue: 8000 },
        }),
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
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        getBarChartGraphConfigMock.mockReturnValue([defaultMetricConfig])
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
        render(<AnalyticsShoppingAssistantConfigurableBar />)

        expect(screen.getByText('Revenue influenced')).toBeInTheDocument()
    })

    it('should render the metric value from trend data', () => {
        render(<AnalyticsShoppingAssistantConfigurableBar />)

        expect(screen.getByText('9,500')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(
            <AnalyticsShoppingAssistantConfigurableBar />,
        )

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(
            <AnalyticsShoppingAssistantConfigurableBar />,
        )

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should render with negative trend icon when trend is negative', () => {
        getBarChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                useTrendData: jest.fn().mockReturnValue({
                    isFetching: false,
                    isError: false,
                    data: { value: 7000, prevValue: 8000 },
                }),
            },
        ])

        const { container } = render(
            <AnalyticsShoppingAssistantConfigurableBar />,
        )

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render all channel legend items', () => {
        render(<AnalyticsShoppingAssistantConfigurableBar />)

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByText('SMS')).toBeInTheDocument()
    })

    it('should render responsive container for chart', () => {
        const { container } = render(
            <AnalyticsShoppingAssistantConfigurableBar />,
        )

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render loading skeleton when trend data is fetching', () => {
        getBarChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                useTrendData: jest.fn().mockReturnValue({
                    data: undefined,
                    isFetching: true,
                }),
            },
        ])

        render(<AnalyticsShoppingAssistantConfigurableBar />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render metric selector when multiple metrics are present', () => {
        const secondMetricConfig: ConfigurableGraphMetricConfig = {
            ...defaultMetricConfig,
            measure: 'ordersInfluencedCount',
            name: 'Orders influenced',
            useTrendData: jest.fn().mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: 120, prevValue: 100 },
            }),
        }
        getBarChartGraphConfigMock.mockReturnValue([
            defaultMetricConfig,
            secondMetricConfig,
        ])

        render(<AnalyticsShoppingAssistantConfigurableBar />)

        expect(
            screen.getByRole('button', { name: /Revenue influenced/i }),
        ).toBeInTheDocument()
    })
})
