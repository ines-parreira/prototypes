import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment/moment'

import {useDistributionTrendReportData} from 'hooks/reporting/common/useDistributionTrendReportData'
import {useTables} from 'hooks/reporting/common/useTableReportData'

import {
    useTimeSeriesPerDimensionReportData,
    useTimeSeriesReportData,
} from 'hooks/reporting/common/useTimeSeriesReportData'
import {useTrendReportData} from 'hooks/reporting/common/useTrendReportData'
import {useCustomReportData} from 'hooks/reporting/custom-reports/useCustomReportData'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    CustomReportChartSchema,
    CustomReportChildType,
    CustomReportRowSchema,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {ServiceLevelAgreementsChart} from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'
import {
    OverviewChartConfig,
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {TicketFieldsChart} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)
jest.mock('hooks/reporting/common/useTimeSeriesReportData')
const useTimeSeriesReportDataMock = assumeMock(useTimeSeriesReportData)
jest.mock('hooks/reporting/common/useDistributionTrendReportData')
const useDistributionTrendReportDataMock = assumeMock(
    useDistributionTrendReportData
)
const useTimeSeriesPerDimensionReportDataMock = assumeMock(
    useTimeSeriesPerDimensionReportData
)
jest.mock('hooks/reporting/common/useTableReportData')
const useTablesMock = assumeMock(useTables)
jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)
jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)

describe('useDownloadCustomReportData', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const trendChartId = OverviewChart.MessagesPerTicketTrendCard
    const trendChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: trendChartId,
    }
    const timeSeriesChartId = OverviewChart.MessagesSentGraph
    const timeSeriesChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: timeSeriesChartId,
    }
    const timeSeriesPerDimensionChartId =
        ServiceLevelAgreementsChart.AchievedAndBreachedTicketsChart
    const timeSeriesPerDimensionChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: timeSeriesPerDimensionChartId,
    }
    const distributionChartId = OverviewChart.WorkloadPerChannelChart
    const distributionChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: distributionChartId,
    }
    const tableChartId = TicketFieldsChart.TicketDistributionTable
    const tableChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: tableChartId,
    }
    const unknownChartId = 'someChartId'
    const unknownChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: unknownChartId,
    }
    const reportRow: CustomReportRowSchema = {
        type: CustomReportChildType.Row,
        children: [
            trendChart,
            timeSeriesChart,
            timeSeriesPerDimensionChart,
            distributionChart,
            tableChart,
            unknownChart,
        ],
    }
    const exampleCustomReport: CustomReportSchema = {
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
        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: [],
        } as unknown as ReturnType<typeof useAgentsTableConfigSetting>)
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity,
            isAnalyticsNewFilters: true,
        })
        useTrendReportDataMock.mockReturnValue({data: [], isFetching: false})
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
    })

    it('should download for charts from custom report', () => {
        const {result} = renderHook(() =>
            useCustomReportData(exampleCustomReport)
        )

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
            ])
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
            ])
        )
        expect(result.current).toEqual({
            files: {
                ...createTimeSeriesReport([], exampleCustomReport.name).files,
                ...createTrendReport([], exampleCustomReport.name).files,
            },
            fileName: getCsvFileNameWithDates(
                statsFilters.period,
                exampleCustomReport.name
            ),
            isLoading: false,
        })
    })

    it('should return isLoading flag', () => {
        useTrendReportDataMock.mockReturnValue({data: [], isFetching: true})
        useTimeSeriesReportDataMock.mockReturnValue({
            data: [],
            isFetching: true,
        })
        useDistributionTrendReportDataMock.mockReturnValue({
            data: [],
            isFetching: true,
        })

        const {result} = renderHook(() =>
            useCustomReportData(exampleCustomReport)
        )

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
            ])
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
            ])
        )
        expect(result.current).toEqual({
            files: {
                ...createTimeSeriesReport([], exampleCustomReport.name).files,
                ...createTrendReport([], exampleCustomReport.name).files,
            },
            fileName: getCsvFileNameWithDates(
                statsFilters.period,
                exampleCustomReport.name
            ),
            isLoading: true,
        })
    })
})
