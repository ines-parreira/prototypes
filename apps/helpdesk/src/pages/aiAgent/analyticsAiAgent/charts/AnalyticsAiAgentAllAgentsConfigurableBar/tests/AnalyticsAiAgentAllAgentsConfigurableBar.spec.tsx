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

import { AnalyticsAiAgentAllAgentsConfigurableBar } from '../AnalyticsAiAgentAllAgentsConfigurableBar'

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

describe('AnalyticsAiAgentAllAgentsConfigurableBar', () => {
    const mockChartData = [
        { name: 'Email', value: 5000 },
        { name: 'Chat', value: 3000 },
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
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal',
        interpretAs: 'more-is-better',
        useTrendData: jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 1000, prevValue: 800 },
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
        render(<AnalyticsAiAgentAllAgentsConfigurableBar />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should render the metric value from trend data', () => {
        render(<AnalyticsAiAgentAllAgentsConfigurableBar />)

        expect(screen.getByText('1,000')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(
            <AnalyticsAiAgentAllAgentsConfigurableBar />,
        )

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(
            <AnalyticsAiAgentAllAgentsConfigurableBar />,
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
                    data: { value: 700, prevValue: 800 },
                }),
            },
        ])

        const { container } = render(
            <AnalyticsAiAgentAllAgentsConfigurableBar />,
        )

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render all channel legend items', () => {
        render(<AnalyticsAiAgentAllAgentsConfigurableBar />)

        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Chat')).toBeInTheDocument()
    })

    it('should render responsive container for chart', () => {
        const { container } = render(
            <AnalyticsAiAgentAllAgentsConfigurableBar />,
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

        render(<AnalyticsAiAgentAllAgentsConfigurableBar />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should pass isInstagramDmsEnabled: true to getBarChartGraphConfig when flag is enabled', () => {
        render(<AnalyticsAiAgentAllAgentsConfigurableBar />)

        expect(getBarChartGraphConfigMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ isInstagramDmsEnabled: true }),
        )
    })

    it('should pass isInstagramDmsEnabled: false to getBarChartGraphConfig when flag is disabled', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<AnalyticsAiAgentAllAgentsConfigurableBar />)

        expect(getBarChartGraphConfigMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ isInstagramDmsEnabled: false }),
        )
    })

    it('should render metric selector when multiple metrics are present', () => {
        const secondMetricConfig: ConfigurableGraphMetricConfig = {
            ...defaultMetricConfig,
            measure: 'automationRate',
            name: 'AI Agent automation rate',
            useTrendData: jest.fn().mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: 75, prevValue: 70 },
            }),
        }
        getBarChartGraphConfigMock.mockReturnValue([
            defaultMetricConfig,
            secondMetricConfig,
        ])

        render(<AnalyticsAiAgentAllAgentsConfigurableBar />)

        expect(
            screen.getByRole('button', { name: /automated interactions/i }),
        ).toBeInTheDocument()
    })
})
