import { useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useListStores } from '@gorgias/helpdesk-queries'

import { ReportingGranularity } from 'domains/reporting/models/types'
import * as aiAgentStatsFiltersHooks from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { getLineChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { AnalyticsAiAgentSupportConfigurableLine } from '../AnalyticsAiAgentSupportConfigurableLine'

jest.mock('@repo/feature-flags')
jest.mock('@gorgias/helpdesk-queries')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection',
    () => ({
        useSaveConfigurableGraphSelection: () => ({ onSelect: jest.fn() }),
    }),
)
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock(
    'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportConfigurableLine/DEPRECATED_AnalyticsSupportAgentLineChart',
    () => ({
        DEPRECATED_AnalyticsSupportAgentLineChart: () => (
            <div>Deprecated chart</div>
        ),
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getLineChartGraphConfig: jest.fn(),
}))
const getLineChartGraphConfigMock = assumeMock(getLineChartGraphConfig)
const useListStoresMock = assumeMock(useListStores)
const useFlagWithLoadingMocked = assumeMock(useFlagWithLoading)

describe('AnalyticsAiAgentSupportConfigurableLine', () => {
    const mockTimeSeriesData = [
        { date: 'Jun 1 2024', value: 800 },
        { date: 'Jun 2 2024', value: 900 },
        { date: 'Jun 3 2024', value: 1000 },
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

        useListStoresMock.mockReturnValue({ data: [] } as any)
        getLineChartGraphConfigMock.mockReturnValue([defaultMetricConfig])
        useFlagWithLoadingMocked.mockReturnValue({
            value: true,
            isLoading: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<AnalyticsAiAgentSupportConfigurableLine />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should render the metric value from trend data', () => {
        render(<AnalyticsAiAgentSupportConfigurableLine />)

        expect(screen.getByText('1,000')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(
            <AnalyticsAiAgentSupportConfigurableLine />,
        )

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(
            <AnalyticsAiAgentSupportConfigurableLine />,
        )

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
                    data: { value: 700, prevValue: 800 },
                }),
            },
        ])

        const { container } = render(
            <AnalyticsAiAgentSupportConfigurableLine />,
        )

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render responsive container for chart', () => {
        const { container } = render(
            <AnalyticsAiAgentSupportConfigurableLine />,
        )

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

        render(<AnalyticsAiAgentSupportConfigurableLine />)

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

        render(<AnalyticsAiAgentSupportConfigurableLine />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render deprecated chart when feature flag is disabled', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<AnalyticsAiAgentSupportConfigurableLine />)

        expect(screen.getByText('Deprecated chart')).toBeInTheDocument()
    })

    it('should render metric selector when multiple metrics are present', () => {
        const secondMetricConfig: ConfigurableGraphMetricConfig = {
            ...defaultMetricConfig,
            measure: 'averageDecreaseInFirstResponseTime',
            name: 'Decrease in FRT',
            useTrendData: jest.fn().mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: 3600, prevValue: 4200 },
            }),
        }
        getLineChartGraphConfigMock.mockReturnValue([
            defaultMetricConfig,
            secondMetricConfig,
        ])

        render(<AnalyticsAiAgentSupportConfigurableLine />)

        expect(
            screen.getByRole('button', { name: /automated interactions/i }),
        ).toBeInTheDocument()
    })
})
