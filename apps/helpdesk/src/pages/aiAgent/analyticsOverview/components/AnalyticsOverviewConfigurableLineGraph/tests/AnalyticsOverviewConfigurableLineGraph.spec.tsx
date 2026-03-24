import { useFlag } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useListStores } from '@gorgias/helpdesk-queries'

import * as automateFiltersHooks from 'domains/reporting/hooks/automate/useAutomateFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getLineChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { AnalyticsOverviewConfigurableLineGraph } from '../AnalyticsOverviewConfigurableLineGraph'

jest.mock('@repo/feature-flags')
jest.mock('@gorgias/helpdesk-queries')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection',
    () => ({
        useSaveConfigurableGraphSelection: () => ({ onSelect: jest.fn() }),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext',
    () => ({
        useDashboardContext: jest.fn().mockReturnValue(null),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewConfigurableLineGraph/DEPRECATED_AutomationLineChart',
    () => ({
        DEPRECATED_AutomationLineChart: () => <div>Deprecated chart</div>,
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getLineChartGraphConfig: jest.fn(),
}))
const getLineChartGraphConfigMock = assumeMock(getLineChartGraphConfig)
const useListStoresMock = assumeMock(useListStores)

const useFlagMocked = assumeMock(useFlag)

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
        useTrendData: jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 0.32, prevValue: 0.3 },
        }),
        dimensions: [defaultDimension],
    }

    beforeAll(() => {
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
        jest.spyOn(automateFiltersHooks, 'useAutomateFilters').mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-06-01',
                    end_datetime: '2024-06-07',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        useListStoresMock.mockReturnValue({ data: [] } as any)
        getLineChartGraphConfigMock.mockReturnValue([defaultMetricConfig])
        useFlagMocked.mockReturnValue(true)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<AnalyticsOverviewConfigurableLineGraph />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render the metric value from trend data', () => {
        render(<AnalyticsOverviewConfigurableLineGraph />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<AnalyticsOverviewConfigurableLineGraph />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AnalyticsOverviewConfigurableLineGraph />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should render with negative trend icon when trend is negative', () => {
        getLineChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                useTrendData: jest.fn().mockReturnValue({
                    isFetching: false,
                    isError: false,
                    data: { value: 0.28, prevValue: 0.3 },
                }),
            },
        ])

        const { container } = render(<AnalyticsOverviewConfigurableLineGraph />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<AnalyticsOverviewConfigurableLineGraph />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should pass stores from useListStores to getLineChartGraphConfig', () => {
        const mockStores = [
            {
                store_integration_id: 123,
                name: 'my-store',
                created_datetime: '2025-01-01T00:00:00Z',
            },
        ]
        useListStoresMock.mockReturnValue({ data: mockStores } as any)

        render(<AnalyticsOverviewConfigurableLineGraph />)

        expect(getLineChartGraphConfigMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.anything(),
            { stores: mockStores },
        )
    })

    it('should render loading skeleton when trend data is fetching', () => {
        getLineChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                useTrendData: jest.fn().mockReturnValue({
                    data: undefined,
                    isFetching: true,
                }),
            },
        ])

        render(<AnalyticsOverviewConfigurableLineGraph />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })
})
