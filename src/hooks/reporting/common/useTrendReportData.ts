import {useEffect, useState} from 'react'

import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'

export const useTrendReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    workloadReportSource: {fetchTrend: MetricTrendFetch; title: string}[]
) => {
    const [workloadTrendData, setWorkloadTrendData] = useState<{
        isFetching: boolean
        data: {
            label: string
            value: number | string | null | undefined
            prevValue: number | string | null | undefined
        }[]
    }>({
        isFetching: true,
        data: [],
    })

    useEffect(() => {
        const workloadTrendPromises = workloadReportSource.map((r) =>
            r.fetchTrend(cleanStatsFilters, userTimezone)
        )
        void Promise.all([...workloadTrendPromises])
            .then((results) => {
                setWorkloadTrendData({
                    isFetching: false,
                    data: workloadReportSource.map((r, index) => ({
                        label: r.title,
                        value: results[index].data?.value,
                        prevValue: results[index].data?.prevValue,
                    })),
                })
            })
            .catch(() => setWorkloadTrendData({isFetching: false, data: []}))
    }, [cleanStatsFilters, userTimezone, workloadReportSource])

    return workloadTrendData
}
