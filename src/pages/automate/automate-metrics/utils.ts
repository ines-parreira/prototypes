import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { formatMetricValue } from 'pages/stats/common/utils'

export const getTrendProps = (metricTrend: MetricTrend) => ({
    value: metricTrend.data?.value || 0,
    prevValue: metricTrend.data?.prevValue || 0,
    interpretAs: 'more-is-better' as const,
})

export const getTrendPropsToPercent = (metricTrend: MetricTrend) => ({
    value: (metricTrend.data?.value || 0) * 100,
    prevValue: (metricTrend.data?.prevValue || 0) * 100,
    interpretAs: 'more-is-better' as const,
})

export const toPercentage = (value: number) =>
    `${parseFloat((value * 100).toFixed(2))}%`

export const toDuration = (trend: MetricTrend) => {
    return (
        (trend.data?.value &&
            formatMetricValue(trend.data?.value, 'duration')) ||
        '0h 0m'
    )
}
