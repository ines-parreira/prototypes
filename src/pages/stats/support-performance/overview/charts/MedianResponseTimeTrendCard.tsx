import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const MedianResponseTimeTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.MedianResponseTime]}
            chartId={chartId}
            dashboard={dashboard}
            drillDownMetric={OverviewMetric.MedianResponseTime}
        />
    )
}
