import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { useConfigurableGraphsReportData } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { useDistributionTrendReportData } from 'domains/reporting/hooks/common/useDistributionTrendReportData'
import { useTables } from 'domains/reporting/hooks/common/useTableReportData'
import {
    useTimeSeriesPerDimensionReportData,
    useTimeSeriesReportData,
} from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useSanitizedDashboard } from 'domains/reporting/hooks/dashboards/useSanitizedDashboard'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type {
    ChartConfig,
    DashboardChartSchema,
    DashboardRowSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DashboardChildType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { ServiceLevelAgreementsChart } from 'domains/reporting/pages/sla/ServiceLevelAgreementsReportConfig'
import {
    OverviewChartConfig,
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { TicketFieldsChart } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'domains/reporting/services/supportPerformanceReportingService'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/dashboards/useSanitizedDashboard')
const useSanitizedDashboardMock = assumeMock(useSanitizedDashboard)

jest.mock('domains/reporting/hooks/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)
jest.mock('domains/reporting/hooks/common/useTimeSeriesReportData')
const useTimeSeriesReportDataMock = assumeMock(useTimeSeriesReportData)
jest.mock('domains/reporting/hooks/common/useDistributionTrendReportData')
const useDistributionTrendReportDataMock = assumeMock(
    useDistributionTrendReportData,
)
const useTimeSeriesPerDimensionReportDataMock = assumeMock(
    useTimeSeriesPerDimensionReportData,
)
jest.mock('domains/reporting/hooks/common/useTableReportData')
const useTablesMock = assumeMock(useTables)
jest.mock('domains/reporting/hooks/common/useConfigurableGraphsReportData')
const useConfigurableGraphsMock = assumeMock(useConfigurableGraphsReportData)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock('domains/reporting/hooks/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)

describe('useDownloadDashboardData', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const trendChartId = OverviewChart.MessagesPerTicketTrendCard
    const trendChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: trendChartId,
    }
    const timeSeriesChartId = OverviewChart.MessagesSentGraph
    const timeSeriesChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: timeSeriesChartId,
    }
    const timeSeriesPerDimensionChartId =
        ServiceLevelAgreementsChart.AchievedAndBreachedTicketsChart
    const timeSeriesPerDimensionChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: timeSeriesPerDimensionChartId,
    }
    const distributionChartId = OverviewChart.WorkloadPerChannelChart
    const distributionChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: distributionChartId,
    }
    const tableChartId = TicketFieldsChart.TicketDistributionTable
    const tableChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: tableChartId,
    }
    const unknownChartId = 'someChartId'
    const unknownChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: unknownChartId,
    }
    const reportRow: DashboardRowSchema = {
        type: DashboardChildType.Row,
        children: [
            trendChart,
            timeSeriesChart,
            timeSeriesPerDimensionChart,
            distributionChart,
            tableChart,
            unknownChart,
        ],
    }
    const exampleDashboard: DashboardSchema = {
        analytics_filter_id: 0,
        children: [reportRow],
        id: 0,
        name: 'Some report name',
        emoji: null,
    }
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day

    beforeEach(() => {
        useSanitizedDashboardMock.mockImplementation((dash) => dash)
        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: [],
        } as unknown as ReturnType<typeof useAgentsTableConfigSetting>)
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity,
        })
        useTrendReportDataMock.mockReturnValue({ data: [], isFetching: false })
        useTimeSeriesReportDataMock.mockReturnValue({
            data: [],
            isFetching: false,
        })
        useTimeSeriesPerDimensionReportDataMock.mockReturnValue({
            data: [],
            isFetching: false,
        })
        useDistributionTrendReportDataMock.mockReturnValue({
            data: [],
            isFetching: false,
        })
        useTablesMock.mockReturnValue({
            files: {},
            isFetching: false,
        })
        useConfigurableGraphsMock.mockReturnValue({
            files: {},
            isFetching: false,
        })
    })

    it('should download for charts from dashboard', () => {
        const { result } = renderHook(() => useDashboardData(exampleDashboard))

        expect(useTrendReportDataMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            expect.arrayContaining([
                {
                    fetchTrend:
                        OverviewMetricConfig[OverviewMetric.MessagesPerTicket]
                            .fetchTrend,
                    title: SupportPerformanceOverviewReportConfig.charts[
                        trendChartId
                    ].label,
                    metricFormat:
                        OverviewMetricConfig[OverviewMetric.MessagesPerTicket]
                            .metricFormat,
                },
            ]),
        )
        expect(useTimeSeriesReportDataMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            granularity,
            expect.arrayContaining([
                {
                    fetchTimeSeries:
                        OverviewChartConfig[OverviewMetric.MessagesSent]
                            .fetchTimeSeries,
                    title: SupportPerformanceOverviewReportConfig.charts[
                        timeSeriesChartId
                    ].label,
                },
            ]),
        )
        expect(result.current).toEqual({
            files: {
                ...createTimeSeriesReport([], exampleDashboard.name).files,
                ...createTrendReport([], exampleDashboard.name).files,
            },
            fileName: getCsvFileNameWithDates(
                statsFilters.period,
                exampleDashboard.name,
            ),
            isLoading: false,
        })
    })

    it('should use provided chartConfigs instead of the global lookup table', () => {
        const customFetchTrend = jest.fn()
        const chartConfigs: Record<string, ChartConfig> = {
            [trendChartId]: {
                ...SupportPerformanceOverviewReportConfig.charts[trendChartId],
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: customFetchTrend,
                        metricFormat: 'decimal' as const,
                    },
                ],
            },
        }

        renderHook(() =>
            useDashboardData(exampleDashboard, false, chartConfigs),
        )

        expect(useTrendReportDataMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            expect.arrayContaining([
                expect.objectContaining({ fetchTrend: customFetchTrend }),
            ]),
        )
    })

    it('should pass only the period filter when isAiAgentDashboard is true', () => {
        const statsFiltersWithAgents = {
            ...statsFilters,
            agents: { values: [1, 2], operator: 'AND' },
        } as unknown as StatsFilters

        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFiltersWithAgents,
            userTimezone,
            granularity,
        })

        renderHook(() => useDashboardData(exampleDashboard, true))

        expect(useTrendReportDataMock).toHaveBeenCalledWith(
            { period: statsFilters.period },
            userTimezone,
            expect.any(Array),
        )
        expect(useTimeSeriesReportDataMock).toHaveBeenCalledWith(
            { period: statsFilters.period },
            userTimezone,
            granularity,
            expect.any(Array),
        )
    })

    it('should call useConfigurableGraphs with configurable chart entries', () => {
        const customFetch = jest.fn()
        const configurableChartId = 'configurableChart'

        const chartConfigs: Record<string, ChartConfig> = {
            [configurableChartId]: {
                chartComponent: null as any,
                description: 'testing',
                chartType: ChartType.Graph,
                label: 'Configurable Chart',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableBarGraph,
                        fetch: customFetch,
                    },
                ],
            },
        }
        const dashboard: DashboardSchema = {
            ...exampleDashboard,
            children: [
                {
                    type: DashboardChildType.Chart,
                    config_id: configurableChartId,
                    metadata: {
                        savedMeasure: 'automationRate',
                        savedDimension: 'channel',
                    },
                },
            ],
        }

        renderHook(() => useDashboardData(dashboard, false, chartConfigs))

        expect(useConfigurableGraphsMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            granularity,
            expect.arrayContaining([
                expect.objectContaining({
                    fetch: customFetch,
                    savedMeasure: 'automationRate',
                    savedDimension: 'channel',
                    chartId: configurableChartId,
                }),
            ]),
        )
    })

    it('should include configurable graph files in the result', () => {
        useConfigurableGraphsMock.mockReturnValue({
            files: {
                'automation-rate-timeseries_2024-01-01_2024-01-31.csv':
                    'csv content',
            },
            isFetching: false,
        })

        const { result } = renderHook(() => useDashboardData(exampleDashboard))

        expect(result.current.files).toMatchObject({
            'automation-rate-timeseries_2024-01-01_2024-01-31.csv':
                'csv content',
        })
    })

    it('should return isLoading flag', () => {
        useTrendReportDataMock.mockReturnValue({ data: [], isFetching: true })
        useTimeSeriesReportDataMock.mockReturnValue({
            data: [],
            isFetching: true,
        })
        useDistributionTrendReportDataMock.mockReturnValue({
            data: [],
            isFetching: true,
        })

        const { result } = renderHook(() => useDashboardData(exampleDashboard))

        expect(useTrendReportDataMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            expect.arrayContaining([
                {
                    fetchTrend:
                        OverviewMetricConfig[OverviewMetric.MessagesPerTicket]
                            .fetchTrend,
                    title: SupportPerformanceOverviewReportConfig.charts[
                        trendChartId
                    ].label,
                    metricFormat:
                        OverviewMetricConfig[OverviewMetric.MessagesPerTicket]
                            .metricFormat,
                },
            ]),
        )
        expect(useTimeSeriesReportDataMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            granularity,
            expect.arrayContaining([
                {
                    fetchTimeSeries:
                        OverviewChartConfig[OverviewMetric.MessagesSent]
                            .fetchTimeSeries,
                    title: SupportPerformanceOverviewReportConfig.charts[
                        timeSeriesChartId
                    ].label,
                },
            ]),
        )
        expect(result.current).toEqual({
            files: {
                ...createTimeSeriesReport([], exampleDashboard.name).files,
                ...createTrendReport([], exampleDashboard.name).files,
            },
            fileName: getCsvFileNameWithDates(
                statsFilters.period,
                exampleDashboard.name,
            ),
            isLoading: true,
        })
    })
})
