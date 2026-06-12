import { formatMetricValue } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import { useAiAgentTrendCardDrillDown } from 'domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { useStatsMetricTimeSeries } from 'domains/reporting/hooks/useStatsMetricTimeSeries'
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
import { toTimeSeriesData } from 'domains/reporting/utils/configurableChartUtils/formatters'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

jest.mock('@repo/reporting', () => ({
    formatMetricValue: jest.fn(),
}))
const mockFormatMetricValue = jest.mocked(formatMetricValue)

jest.mock('domains/reporting/hooks/useStatsMetricTimeSeries')
const mockUseStatsMetricTimeSeries = jest.mocked(useStatsMetricTimeSeries)

jest.mock('domains/reporting/utils/configurableChartUtils/formatters')
const mockToTimeSeriesData = jest.mocked(toTimeSeriesData)

jest.mock('domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown')
const useAiAgentTrendCardDrillDownMock = assumeMock(
    useAiAgentTrendCardDrillDown,
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')

const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)

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
        stores: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [123],
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
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: mockCleanStatsFilters.period,
                stores: mockCleanStatsFilters.stores,
            },
        } as any)
        mockFormatMetricValue.mockReturnValue('42%')
        mockUseStatsMetricTimeSeries.mockReturnValue({
            data: [[]],
            isFetching: false,
        } as any)
        mockToTimeSeriesData.mockReturnValue({ data: [], isLoading: false })
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
                storeState: defaultState,
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
                storeState: defaultState,
            },
        )

        expect(result.current.trend).toEqual({
            isFetching: true,
            isError: false,
            data: {
                label: 'Test Metric',
                value: null,
                prevValue: null,
            },
        })
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
                storeState: defaultState,
            },
        )

        expect(result.current.trend).toEqual({
            isFetching: false,
            isError: true,
            data: {
                label: 'Test Metric',
                value: null,
                prevValue: null,
            },
        })
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
                storeState: defaultState,
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
                storeState: defaultState,
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
                storeState: defaultState,
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
                storeState: defaultState,
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
                storeState: defaultState,
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
                storeState: defaultState,
            },
        )

        expect(result.current.trend.data).toEqual({
            label: 'Test Metric',
            value: null,
            prevValue: null,
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
                storeState: defaultState,
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
                storeState: defaultState,
            },
        )

        expect(mockUseTrend).toHaveBeenCalledWith(mockCleanStatsFilters, 'UTC')
    })

    it('should pass period and stores to useTrend when isAiAgentTrendCard is true', () => {
        mockUseTrend.mockReturnValue(mockTrendData)

        renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                storeState: defaultState,
            },
        )

        expect(mockUseTrend).toHaveBeenCalledWith(
            {
                period: mockCleanStatsFilters.period,
                stores: mockCleanStatsFilters.stores,
            },
            'UTC',
        )
    })

    it('should pass period only to useTrend when isAiAgentTrendCard is true and period is before stores availability date', () => {
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: { period: mockCleanStatsFilters.period },
        } as any)
        mockUseTrend.mockReturnValue(mockTrendData)

        renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                storeState: defaultState,
            },
        )

        expect(mockUseTrend).toHaveBeenCalledWith(
            { period: mockCleanStatsFilters.period },
            'UTC',
        )
    })

    it('should pass period only to useTrend when isAiAgentTrendCard is true and useAiAgentStatsFilters omits stores', () => {
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: { period: mockCleanStatsFilters.period },
        } as any)
        mockUseTrend.mockReturnValue(mockTrendData)

        renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: mockChartConfig,
                    useTrend: mockUseTrend,
                }),
            {
                storeState: defaultState,
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
                storeState: defaultState,
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
                storeState: defaultState,
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
                storeState: defaultState,
            },
        )

        expect(result.current.drillDown).toBeUndefined()
    })

    describe('timeSeriesView properties', () => {
        beforeEach(() => {
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
                    storeState: defaultState,
                },
            )

        it('is enabled when isAiAgentTrendCard is true', () => {
            const { result } = renderWithTimeSeries({ comingSoon: true })

            expect(result.current.timeSeriesView).toBeDefined()
        })

        it('returns comingSoon true when enabled but timeSeriesView is not provided', () => {
            const { result } = renderHook(
                () =>
                    useReportingTrendCardProps({
                        isAiAgentTrendCard: true,
                        chartConfig: mockChartConfig,
                        useTrend: mockUseTrend,
                    }),
                {
                    storeState: defaultState,
                },
            )

            expect(result.current.timeSeriesView).toEqual({ comingSoon: true })
        })

        it('is disabled when prop is passed', () => {
            const { result } = renderWithTimeSeries({
                disabled: true,
                comingSoon: true,
            })

            expect(result.current.timeSeriesView).toBeUndefined()
        })

        it('builds the time series from useStatsMetricTimeSeries when useChartData is invoked', () => {
            const { result } = renderWithTimeSeries({
                queryFactory: mockQueryFactory,
            })

            result.current.timeSeriesView?.useChartData?.()

            expect(mockUseStatsMetricTimeSeries).toHaveBeenCalledWith(
                mockQueryFactory,
                {
                    period: mockCleanStatsFilters.period,
                    stores: mockCleanStatsFilters.stores,
                },
                'UTC',
                ReportingGranularity.Day,
            )
            expect(mockToTimeSeriesData).toHaveBeenCalledWith(
                { data: [[]], isFetching: false },
                ReportingGranularity.Day,
                undefined,
                undefined,
            )
        })

        it('passes measureName and valueTransform to toTimeSeriesData when provided', () => {
            const valueTransform = jest.fn((v: number | null) => v)

            const { result } = renderWithTimeSeries({
                queryFactory: mockQueryFactory,
                measureName: 'inboundCallsCount',
                valueTransform,
            })

            result.current.timeSeriesView?.useChartData?.()

            expect(mockToTimeSeriesData).toHaveBeenCalledWith(
                { data: [[]], isFetching: false },
                ReportingGranularity.Day,
                'inboundCallsCount',
                valueTransform,
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

    it('should build hint from tooltipConfig when provided, using label as title', () => {
        const configWithTooltipConfig: ChartConfig = {
            ...mockChartConfig,
            tooltipConfig: {
                title: 'Ignored title',
                caption: 'Tooltip caption',
                link: 'https://example.com',
                linkText: 'Learn more',
            },
        }
        mockUseTrend.mockReturnValue(mockTrendData)

        const { result } = renderHook(
            () =>
                useReportingTrendCardProps({
                    isAiAgentTrendCard: true,
                    chartConfig: configWithTooltipConfig,
                    useTrend: mockUseTrend,
                }),
            {
                storeState: defaultState,
            },
        )

        expect(result.current.hint).toEqual({
            title: 'Test Metric',
            caption: 'Tooltip caption',
            link: 'https://example.com',
            linkText: 'Learn more',
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
                storeState: defaultState,
            },
        )

        expect(result.current.drillDown).toBeUndefined()
    })
})
