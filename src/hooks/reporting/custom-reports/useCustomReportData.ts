import {useMemo} from 'react'

import {useDistributionTrendReportData} from 'hooks/reporting/common/useDistributionTrendReportData'

import {useTimeSeriesReportData} from 'hooks/reporting/common/useTimeSeriesReportData'
import {useTrendReportData} from 'hooks/reporting/common/useTrendReportData'
import {MetricPerDimensionFetch} from 'hooks/reporting/distributions'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesFetch} from 'hooks/reporting/useTimeSeries'
import {
    ChartConfig,
    CustomReportChild,
    CustomReportChildType,
    CustomReportSchema,
    DataExportFormat,
} from 'pages/stats/custom-reports/types'
import {SupportPerformanceOverviewReportConfig} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'

import {
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'

const chartsLookupTable: Record<string, ChartConfig | undefined> = {
    ...SupportPerformanceOverviewReportConfig.charts,
}

type Queries = {
    timeSeries: {fetchTimeSeries: TimeSeriesFetch; title: string}[]
    trends: {fetchTrend: MetricTrendFetch; title: string}[]
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
                    title: String(config.label),
                })
            }
            if (producer.type === DataExportFormat.TimeSeries) {
                acc.timeSeries.push({
                    fetchTimeSeries: producer.fetch,
                    title: producer.label ?? String(config.label),
                })
            }
            if (producer.type === DataExportFormat.Distribution) {
                acc.distributions = {
                    ...producer.fetch,
                    title: String(config.label),
                }
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
        trends: [],
        distributions: undefined,
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

    const distributions = useDistributionTrendReportData(
        cleanStatsFilters,
        userTimezone,
        queryGroups.distributions
    )
    const distributionsReport = createTrendReport(
        distributions.data,
        `${getCsvFileNameWithDates(cleanStatsFilters.period, `${queryGroups.distributions?.title} - ${DISTRIBUTIONS_FILE_SUFFIX}`)}`
    )

    const loading = useMemo(() => {
        return [trends, timeSeries, distributions].some(
            (metric) => metric.isFetching
        )
    }, [distributions, timeSeries, trends])

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        customReport.name
    )

    const files = useMemo(
        () => ({
            ...trendsReport.files,
            ...timeSeriesReport.files,
            ...distributionsReport.files,
        }),
        [distributionsReport.files, timeSeriesReport.files, trendsReport.files]
    )

    return {files, fileName, isLoading: loading}
}
