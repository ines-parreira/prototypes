import {useEffect, useState} from 'react'

import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {formatMetricValue, MetricValueFormat} from 'pages/stats/common/utils'
import {FormattedTrendDataWithLabel} from 'services/reporting/supportPerformanceReportingService'

export const useTrendReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    trendsReportSource: {
        fetchTrend: MetricTrendFetch
        metricFormat: MetricValueFormat
        title: string
    }[]
) => {
    const [trendData, setTrendData] = useState<{
        isFetching: boolean
        data: FormattedTrendDataWithLabel[]
    }>({
        isFetching: true,
        data: [],
    })

    useEffect(() => {
        const workloadTrendPromises = trendsReportSource.map((r) =>
            r.fetchTrend(cleanStatsFilters, userTimezone)
        )
        void Promise.all([...workloadTrendPromises])
            .then((results) => {
                setTrendData({
                    isFetching: false,
                    data: trendsReportSource.map((r, index) => ({
                        label: r.title,
                        value: formatMetricValue(
                            results[index].data?.value,
                            r.metricFormat
                        ),
                        prevValue: formatMetricValue(
                            results[index].data?.prevValue,
                            r.metricFormat
                        ),
                    })),
                })
            })
            .catch(() => setTrendData({isFetching: false, data: []}))
    }, [cleanStatsFilters, userTimezone, trendsReportSource])

    return trendData
}
