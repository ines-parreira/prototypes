import { useEffect, useState } from 'react'

import { getPeriodDateTimes } from 'domains/reporting/hooks/helpers'
import type {
    TimeSeriesFetch,
    TimeSeriesPerDimension,
    TimeSeriesPerDimensionFetch,
} from 'domains/reporting/hooks/useTimeSeries'
import type {
    AggregationWindow,
    Period,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { NOT_AVAILABLE_LABEL } from 'domains/reporting/services/constants'
import type { TimeSeriesDataWithLabels } from 'domains/reporting/services/supportPerformanceReportingService'

export const useTimeSeriesReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    granularity: AggregationWindow,
    timeSeriesReportSource: {
        fetchTimeSeries: TimeSeriesFetch
        title: string
    }[],
) => {
    const [timeSeriesData, setTimeSeriesData] = useState<{
        isFetching: boolean
        data: TimeSeriesDataWithLabels[]
    }>({
        isFetching: true,
        data: [],
    })

    useEffect(() => {
        const timeSeriesPromises = timeSeriesReportSource.map((r) =>
            r.fetchTimeSeries(cleanStatsFilters, userTimezone, granularity),
        )

        void Promise.all(timeSeriesPromises)
            .then((results) => {
                setTimeSeriesData({
                    isFetching: false,
                    data: timeSeriesReportSource.map((r, index) => ({
                        label: r.title,
                        data: results[index],
                    })),
                })
            })
            .catch(() => setTimeSeriesData({ isFetching: false, data: [] }))
    }, [cleanStatsFilters, granularity, timeSeriesReportSource, userTimezone])

    return timeSeriesData
}

const formatTimeSeriesPerDimensionResults = (
    period: Period,
    granularity: ReportingGranularity,
    data: TimeSeriesPerDimension,
    headers: string[],
    dimensions: string[],
): (string | number)[][] => {
    const dates = getPeriodDateTimes(
        [period.start_datetime, period.end_datetime],
        granularity,
    )
    return [
        headers,
        ...dates.map((date) => [
            date,
            ...dimensions.map(
                (dimension) =>
                    data[dimension]?.[0].find(
                        ({ dateTime }) => date === dateTime,
                    )?.value || NOT_AVAILABLE_LABEL,
            ),
        ]),
    ]
}

export const useTimeSeriesPerDimensionReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    timeSeriesReportSource: {
        fetchTimeSeries: TimeSeriesPerDimensionFetch
        title: string
        headers: string[]
        dimensions: string[]
    }[],
) => {
    const [timeSeriesData, setTimeSeriesData] = useState<{
        isFetching: boolean
        data: {
            label: string
            data: (string | number)[][]
        }[]
    }>({
        isFetching: true,
        data: [],
    })

    useEffect(() => {
        const timeSeriesPromises = timeSeriesReportSource.map((r) =>
            r.fetchTimeSeries(cleanStatsFilters, userTimezone, granularity),
        )

        void Promise.all(timeSeriesPromises)
            .then((results) => {
                setTimeSeriesData({
                    isFetching: false,
                    data: results.map((r, index) => ({
                        data: formatTimeSeriesPerDimensionResults(
                            cleanStatsFilters.period,
                            granularity,
                            r,
                            timeSeriesReportSource[index].headers,
                            timeSeriesReportSource[index].dimensions,
                        ),
                        label: timeSeriesReportSource[index].title,
                    })),
                })
            })
            .catch(() => setTimeSeriesData({ isFetching: false, data: [] }))
    }, [cleanStatsFilters, granularity, timeSeriesReportSource, userTimezone])

    return timeSeriesData
}
