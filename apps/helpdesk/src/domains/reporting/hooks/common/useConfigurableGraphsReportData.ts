import { useEffect, useState } from 'react'

import type {
    MetricTrendFormat,
    MultipleTimeSeriesDataItem,
    TimeSeriesDataItem,
} from '@repo/reporting'
import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type {
    AggregationWindow,
    Period,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { createCsv } from 'utils/file'

export type ConfigurableGraphFetch = (
    savedMeasure: string | null | undefined,
    savedDimension: string | null | undefined,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => Promise<{
    files: Record<string, string>
}>

export const useConfigurableGraphsReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    granularity: AggregationWindow,
    fetchGraphData: {
        fetch: ConfigurableGraphFetch
        savedMeasure: string | null | undefined
        savedDimension: string | null | undefined
        chartId: string
    }[],
) => {
    const [graphData, setGraphData] = useState<{
        isFetching: boolean
        files: Record<string, string>
    }>({
        isFetching: true,
        files: {},
    })

    useEffect(() => {
        const promises = fetchGraphData.map((configurableGraphConfig) =>
            configurableGraphConfig.fetch(
                configurableGraphConfig.savedMeasure,
                configurableGraphConfig.savedDimension,
                cleanStatsFilters,
                userTimezone,
                granularity,
            ),
        )
        void Promise.all(promises)
            .then((results) => {
                setGraphData({
                    isFetching: false,
                    files: Object.assign({}, ...results.map((r) => r.files)),
                })
            })
            .catch(() => setGraphData({ isFetching: false, files: {} }))
    }, [fetchGraphData, cleanStatsFilters, granularity, userTimezone])

    return graphData
}

export const toSlug = (name: string) =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

export const buildBarCsvFiles = (
    data: { name: string; value: number | null }[],
    metricName: string,
    dimensionName: string,
    metricFormat: MetricTrendFormat,
    period: Period,
): Record<string, string> => {
    if (!data.length) return {}
    const rows = [
        [dimensionName, metricName],
        ...data.map((item) => [
            item.name,
            formatMetricValue(item.value, metricFormat),
        ]),
    ]
    return {
        [getCsvFileNameWithDates(
            period,
            toSlug(`${metricName}-by-${dimensionName}`),
        )]: createCsv(rows),
    }
}

export const buildTimeSeriesCsvFiles = (
    data: TimeSeriesDataItem[],
    metricName: string,
    metricFormat: MetricTrendFormat,
    period: Period,
): Record<string, string> => {
    if (!data.length || data.every((value) => value.value === 0)) return {}

    const rows = [
        ['Date', metricName],
        ...data.map((row) => [
            row.date,
            formatMetricValue(row.value, metricFormat),
        ]),
    ]
    return {
        [getCsvFileNameWithDates(period, `${toSlug(metricName)}-timeseries`)]:
            createCsv(rows),
    }
}

export const buildMultipleTimeSeriesCsvFiles = (
    data: MultipleTimeSeriesDataItem[],
    metricName: string,
    metricFormat: MetricTrendFormat,
    period: Period,
): Record<string, string> => {
    if (
        !data.length ||
        !data[0].values.length ||
        data.every((series) =>
            series.values.every((point) => point.value === 0),
        )
    )
        return {}

    const headers = ['Date', ...data.map((series) => series.label)]
    const rows = data[0].values.map((point, index) => [
        point.date,
        ...data.map((series) =>
            formatMetricValue(
                series.values[index]?.value ?? null,
                metricFormat,
            ),
        ),
    ])

    return {
        [getCsvFileNameWithDates(period, `${toSlug(metricName)}-timeseries`)]:
            createCsv([headers, ...rows]),
    }
}
