import { useFlagWithLoading } from '@repo/feature-flags'
import { formatMetricValue } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'

import { useAiAgentTrendCardDrillDown } from 'domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'
import { useOverallTimeSeries } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { mockStore } from 'utils/testing'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTrendCardsWithTimeseries:
            'ai-agent-analytics-dashboards-trend-cards-with-timeseries',
    },
    useFlagWithLoading: jest.fn(),
}))
const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)

jest.mock('@repo/reporting', () => ({
    formatMetricValue: jest.fn(),
}))
const mockFormatMetricValue = jest.mocked(formatMetricValue)

jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    useOverallTimeSeries: jest.fn(),
}))
const mockUseOverallTimeSeries = jest.mocked(useOverallTimeSeries)

jest.mock('domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown')
const useAiAgentTrendCardDrillDownMock = assumeMock(
    useAiAgentTrendCardDrillDown,
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod')
const formatPreviousPeriodMock = assumeMock(formatPreviousPeriod)

describe('useReportingTrendCardProps', () => {
    const mockChartConfig: ChartConfig = {
        chartComponent: jest.fn(),
        label: 'Test Metric',
        description: 'Test metric description',
        csvProducer: null,
        chartType: ChartType.Card,
        metricFormat: 'percent',
        interpretAs: 'more-is-better',
    }

    const mockDashboard: DashboardSchema = {
        id: 1,
        name: 'Test Dashboard',
        analytics_filter_id: null,
        children: [],
        emoji: null,
    }

    const mockTrendData: MetricTrend = {
        data: {
            value: 85,
            prevValue: 70,
        },
        isFetching: false,
        isError: false,
    }

    const mockUseTrend = jest.fn()

    const mockCleanStatsFilters: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2024-01-01T00:00:00+00:00',
            end_datetime: '2024-01-07T23:59:59+00:00',
        },
        channels: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['email'],
        },
        agents: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [42],
        },
    }

    const defaultState = {
        stats: initialState,
    }

    const mockDrillDownReturn = {
        openDrillDownModal: jest.fn(),
        tooltipText: 'Click to view tickets',
    }

    const mockQueryFactory = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: mockCleanStatsFilters,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        formatPreviousPeriodMock.mockReturnValue('Jan 1 - Jan 7')
        useAiAgentTrendCardDrillDownMock.mockReturnValue(undefined)
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockFormatMetricValue.mockReturnValue('42%')
        mockUseOverallTimeSeries.mockReturnValue({ data: [], isLoading: false })
    })

    it('should return trend data with correct structure', () => {
        mockUseTrend.mockReturnValue(mockTrendData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.trend).toEqual({
            isFetching: false,
            isError: false,
            data: {
                label: 'Test Metric',
                value: 85,
                prevValue: 70,
            },
        })
        expect(result.current.isLoading).toBe(false)
        expect(result.current.metricFormat).toBe('percent')
        expect(result.current.interpretAs).toBe('more-is-better')
        expect(result.current.trendBadgeTooltipData.period).toBe(
            'Jan 1 - Jan 7',
        )
        expect(result.current.withBorder).toBe(true)
        expect(result.current.withFixedWidth).toBe(false)
        expect(result.current.hint).toEqual({
            title: 'Test Metric',
            caption: 'Test metric description',
        })
        expect(result.current.actionMenu).toBeUndefined()
    })

    it('should return loading state when trend is fetching', () => {
        const loadingTrendData: MetricTrend = {
            data: undefined,
            isFetching: true,
            isError: false,
        }
        mockUseTrend.mockReturnValue(loadingTrendData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.trend).toEqual({
            isFetching: true,
            isError: false,
            data: {
                label: 'Test Metric',
                value: 0,
                prevValue: 0,
            },
        })
        expect(result.current.isLoading).toBe(true)
    })

    it('should return error state when trend has error', () => {
        const errorTrendData: MetricTrend = {
            data: undefined,
            isFetching: false,
            isError: true,
        }
        mockUseTrend.mockReturnValue(errorTrendData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.trend).toEqual({
            isFetching: false,
            isError: true,
            data: {
                label: 'Test Metric',
                value: 0,
                prevValue: 0,
            },
        })
        expect(result.current.isLoading).toBe(false)
    })

    it('should include actionMenu when chartId is provided', () => {
        mockUseTrend.mockReturnValue(mockTrendData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    chartId: 'test-chart-id',
                    dashboard: mockDashboard,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.actionMenu).toBeDefined()
    })

    it('should not include actionMenu when chartId is not provided', () => {
        mockUseTrend.mockReturnValue(mockTrendData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.actionMenu).toBeUndefined()
    })

    it('should use default interpretAs value when not provided in chartConfig', () => {
        const configWithoutInterpretAs: ChartConfig = {
            ...mockChartConfig,
            interpretAs: undefined,
        }
        mockUseTrend.mockReturnValue(mockTrendData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: configWithoutInterpretAs,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.interpretAs).toBe('more-is-better')
    })

    it('should pass statsFilters and userTimezone to useTrend hook', () => {
        mockUseTrend.mockReturnValue(mockTrendData)

        renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: false,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(mockUseTrend).toHaveBeenCalledWith(mockCleanStatsFilters, 'UTC')
    })

    it('should call formatPreviousPeriod with the period from statsFilters', () => {
        mockUseTrend.mockReturnValue(mockTrendData)

        renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(formatPreviousPeriodMock).toHaveBeenCalledWith(
            mockCleanStatsFilters.period,
        )
    })

    it('should handle undefined data from trend hook', () => {
        const trendDataWithoutData: MetricTrend = {
            data: undefined,
            isFetching: false,
            isError: false,
        }
        mockUseTrend.mockReturnValue(trendDataWithoutData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.trend.data).toEqual({
            label: 'Test Metric',
            value: 0,
            prevValue: 0,
        })
    })

    it('should return correct metricFormat when provided in chartConfig', () => {
        const configWithDifferentFormat: ChartConfig = {
            ...mockChartConfig,
            metricFormat: 'decimal',
        }
        mockUseTrend.mockReturnValue(mockTrendData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: configWithDifferentFormat,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.metricFormat).toBe('decimal')
    })

    it('should pass full cleanStatsFilters to useTrend when isAiAgentTrendCard is false', () => {
        mockUseTrend.mockReturnValue(mockTrendData)

        renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: false,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(mockUseTrend).toHaveBeenCalledWith(mockCleanStatsFilters, 'UTC')
    })

    it('should pass only period to useTrend when isAiAgentTrendCard is true', () => {
        mockUseTrend.mockReturnValue(mockTrendData)

        renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(mockUseTrend).toHaveBeenCalledWith(
            { period: mockCleanStatsFilters.period },
            'UTC',
        )
    })

    it('should return drillDown when hook returns a value', () => {
        mockUseTrend.mockReturnValue(mockTrendData)
        useAiAgentTrendCardDrillDownMock.mockReturnValue(mockDrillDownReturn)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                    drillDownMetricName:
                        AiAgentDrillDownMetricName.AllAgentsCsatCard,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.drillDown).toBe(mockDrillDownReturn)
    })

    it('should return drillDown as undefined when hook returns undefined', () => {
        mockUseTrend.mockReturnValue(mockTrendData)
        useAiAgentTrendCardDrillDownMock.mockReturnValue(undefined)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                    drillDownMetricName:
                        AiAgentDrillDownMetricName.AllAgentsCsatCard,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.drillDown).toBeUndefined()
    })

    it('should return drillDown as undefined when drillDownMetricName is not provided', () => {
        mockUseTrend.mockReturnValue(mockTrendData)
        useAiAgentTrendCardDrillDownMock.mockReturnValue(undefined)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.drillDown).toBeUndefined()
    })

    describe('timeSeriesView properties', () => {
        beforeEach(() => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })
            mockUseTrend.mockReturnValue(mockTrendData)
        })

        const renderWithTimeSeries = (
            timeSeriesView: Parameters<
                typeof useReportingTrendCardProps
            >[0]['timeSeriesView'],
            isAiAgentTrendCard: boolean = true,
        ) =>
            renderHook(
                () =>
                    useReportingTrendCardProps({
                        isAiAgentTrendCard,
                        chartConfig: mockChartConfig,
                        useTrend: mockUseTrend,
                        timeSeriesView,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

        it('is enabled when feature flag is on and isAiAgentTrendCard is true', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            const { result } = renderWithTimeSeries({ comingSoon: true })

            expect(result.current.timeSeriesView).toBeDefined()
        })

        it('is disabled when feature flag is still loading', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: true,
            })

            const { result } = renderWithTimeSeries({})

            expect(result.current.timeSeriesView).toBeUndefined()
        })

        it('is disabled when feature flag is off', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })

            const { result } = renderWithTimeSeries({ comingSoon: true })

            expect(result.current.timeSeriesView).toBeUndefined()
        })

        it('is disabled when isAiAgentTrendCard is false', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            const { result } = renderWithTimeSeries({ comingSoon: true }, false)

            expect(result.current.timeSeriesView).toBeUndefined()
        })

        it('calls useOverallTimeSeries with correct args when useChartData is invoked', () => {
            const { result } = renderWithTimeSeries({
                queryFactory: mockQueryFactory,
            })

            result.current.timeSeriesView?.useChartData?.()

            expect(mockUseOverallTimeSeries).toHaveBeenCalledWith(
                mockQueryFactory,
                { period: mockCleanStatsFilters.period },
                'UTC',
                ReportingGranularity.Day,
            )
        })

        it('uses formatMetricValue with chartConfig.metricFormat by default', () => {
            const { result } = renderWithTimeSeries({})

            result.current.timeSeriesView?.valueFormatter?.(42)

            expect(mockFormatMetricValue).toHaveBeenCalledWith(42, 'percent')
        })

        it('uses custom valueFormatter when provided', () => {
            const customFormatter = jest.fn().mockReturnValue('custom value')

            const { result } = renderWithTimeSeries({
                valueFormatter: customFormatter,
            })

            result.current.timeSeriesView?.valueFormatter?.(42)

            expect(customFormatter).toHaveBeenCalledWith(42)
            expect(mockFormatMetricValue).not.toHaveBeenCalled()
        })
    })

    it('should return drillDown as undefined when trend value is zero', () => {
        mockUseTrend.mockReturnValue({
            data: { value: 0, prevValue: 0 },
            isFetching: false,
            isError: false,
        })
        useAiAgentTrendCardDrillDownMock.mockReturnValue(undefined)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                    drillDownMetricName:
                        AiAgentDrillDownMetricName.AllAgentsCsatCard,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.drillDown).toBeUndefined()
    })
})
