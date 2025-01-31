import {useMemo} from 'react'

import {useDistributionTrendReportData} from 'hooks/reporting/common/useDistributionTrendReportData'

import {useTables} from 'hooks/reporting/common/useTableReportData'
import {
    useTimeSeriesPerDimensionReportData,
    useTimeSeriesReportData,
} from 'hooks/reporting/common/useTimeSeriesReportData'
import {useTrendReportData} from 'hooks/reporting/common/useTrendReportData'
import {MetricPerDimensionFetch} from 'hooks/reporting/distributions'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {
    TimeSeriesFetch,
    TimeSeriesPerDimensionFetch,
} from 'hooks/reporting/useTimeSeries'
import {
    ChartConfig,
    CustomReportChild,
    CustomReportChildType,
    CustomReportSchema,
    DataExportFormat,
    ReportFetch,
} from 'pages/stats/custom-reports/types'
import {ServiceLevelAgreementsReportConfig} from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'
import {SupportPerformanceAgentsReportConfig} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {BusiestTimesReportConfig} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import {ChannelsReportConfig} from 'pages/stats/support-performance/channels/ChannelsReportConfig'
import {SupportPerformanceOverviewReportConfig} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {TicketInsightsTagsReportConfig} from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import {TicketFieldsReportConfig} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import {createTimeSeriesPerDimensionReport} from 'services/reporting/SLAsReportingService'

import {
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'

const chartsLookupTable: Record<string, ChartConfig | undefined> = {
    ...SupportPerformanceOverviewReportConfig.charts,
    ...ServiceLevelAgreementsReportConfig.charts,
    ...TicketFieldsReportConfig.charts,
    ...BusiestTimesReportConfig.charts,
    ...SupportPerformanceAgentsReportConfig.charts,
    ...ChannelsReportConfig.charts,
    ...TicketInsightsTagsReportConfig.charts,
}

type Queries = {
    timeSeries: {fetchTimeSeries: TimeSeriesFetch; title: string}[]
    timeSeriesPerDimension: {
        fetchTimeSeries: TimeSeriesPerDimensionFetch
        title: string
        headers: string[]
        dimensions: string[]
    }[]
    trends: {fetchTrend: MetricTrendFetch; title: string}[]
    tables: {fetchTable: ReportFetch; title: string}[]
    distributions:
        | {
              fetchCurrentDistribution: MetricPerDimensionFetch
              fetchPreviousDistribution: MetricPerDimensionFetch
              labelPrefix: string
              title: string
          }
        | undefined
}

const reduceReport = (acc: Queries, child: CustomReportChild): Queries => {
    if (child.type === CustomReportChildType.Chart) {
        const config = chartsLookupTable[child.config_id]
        if (!config?.csvProducer) {
            return acc
        }

        config.csvProducer.forEach((producer) => {
            if (producer.type === DataExportFormat.Trend) {
                acc.trends.push({
                    fetchTrend: producer.fetch,
                    title: producer.title ?? String(config.label),
                })
            }
            if (producer.type === DataExportFormat.TimeSeries) {
                acc.timeSeries.push({
                    fetchTimeSeries: producer.fetch,
                    title: producer.title ?? String(config.label),
                })
            }
            if (producer.type === DataExportFormat.TimeSeriesPerDimension) {
                acc.timeSeriesPerDimension.push({
                    fetchTimeSeries: producer.fetch,
                    title: producer.title,
                    headers: producer.headers,
                    dimensions: producer.dimensions,
                })
            }
            if (producer.type === DataExportFormat.Distribution) {
                acc.distributions = {
                    ...producer.fetch,
                    title: String(config.label),
                }
            }
            if (producer.type === DataExportFormat.Table) {
                acc.tables.push({
                    fetchTable: producer.fetch,
                    title: String(config.label),
                })
            }
            if (producer.type === DataExportFormat.Table) {
                acc.tables.push({
                    fetchTable: producer.fetch,
                    title: String(config.label),
                })
            }
        })
    }
    if (
        child.type === CustomReportChildType.Section ||
        child.type === CustomReportChildType.Row
    ) {
        return child.children.reduce(reduceReport, acc)
    }
    return acc
}

const getQueryGroupsFromCustomReport = (
    customReport: CustomReportSchema
): Queries => {
    return customReport.children.reduce<Queries>(reduceReport, {
        timeSeries: [],
        timeSeriesPerDimension: [],
        trends: [],
        distributions: undefined,
        tables: [],
    })
}

const TRENDS_FILE_SUFFIX = 'trends'
const TIME_SERIES_FILE_SUFFIX = 'timeSeries'
const DISTRIBUTIONS_FILE_SUFFIX = 'distributions'

export const useCustomReportData = (customReport: CustomReportSchema) => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()

    const queryGroups = useMemo(
        () => getQueryGroupsFromCustomReport(customReport),
        [customReport]
    )

    const trends = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        queryGroups.trends
    )
    const trendsReport = createTrendReport(
        trends.data,
        `${getCsvFileNameWithDates(cleanStatsFilters.period, `${customReport.name} - ${TRENDS_FILE_SUFFIX}`)}`
    )
    const timeSeries = useTimeSeriesReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        queryGroups.timeSeries
    )
    const timeSeriesReport = createTimeSeriesReport(
        timeSeries.data,
        `${getCsvFileNameWithDates(cleanStatsFilters.period, `${customReport.name} - ${TIME_SERIES_FILE_SUFFIX}`)}`
    )

    const timeSeriesPerDimension = useTimeSeriesPerDimensionReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        queryGroups.timeSeriesPerDimension
    )
    const timeSeriesPerDimensionReports = createTimeSeriesPerDimensionReport(
        timeSeriesPerDimension.data,
        cleanStatsFilters.period
    )

    const distributions = useDistributionTrendReportData(
        cleanStatsFilters,
        userTimezone,
        queryGroups.distributions
    )
    const distributionsReport = createTrendReport(
        distributions.data,
        `${getCsvFileNameWithDates(cleanStatsFilters.period, `${queryGroups.distributions?.title} - ${DISTRIBUTIONS_FILE_SUFFIX}`)}`
    )
    const tables = useTables(
        cleanStatsFilters,
        userTimezone,
        granularity,
        queryGroups.tables
    )

    const loading = useMemo(() => {
        return [
            trends,
            timeSeries,
            distributions,
            timeSeriesPerDimension,
            tables,
        ].some((metric) => metric.isFetching)
    }, [distributions, tables, timeSeries, timeSeriesPerDimension, trends])

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        customReport.name
    )

    const files = useMemo(
        () => ({
            ...trendsReport.files,
            ...timeSeriesReport.files,
            ...timeSeriesPerDimensionReports.files,
            ...distributionsReport.files,
            ...tables.files,
        }),
        [
            distributionsReport.files,
            timeSeriesPerDimensionReports.files,
            timeSeriesReport.files,
            trendsReport.files,
            tables.files,
        ]
    )

    return {files, fileName, isLoading: loading}
}
