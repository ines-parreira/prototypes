import {useEffect, useState} from 'react'

import {TimeSeriesFetch} from 'hooks/reporting/useTimeSeries'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {TimeSeriesDataWithLabels} from 'services/reporting/supportPerformanceReportingService'

export const useTimeSeriesReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    timeSeriesReportSource: {fetchTimeSeries: TimeSeriesFetch; title: string}[]
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
            r.fetchTimeSeries(cleanStatsFilters, userTimezone, granularity)
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
            .catch(() => setTimeSeriesData({isFetching: false, data: []}))
    }, [cleanStatsFilters, granularity, timeSeriesReportSource, userTimezone])

    return timeSeriesData
}
