import useLocalStorage from 'hooks/useLocalStorage'
import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { SupportPerformanceTip } from 'pages/stats/support-performance/components/SupportPerformanceTip'
import {
    OverviewMetric,
    OverviewMetricConfig,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { MetricName } from 'services/reporting/constants'

export const MedianFirstResponseTimeTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useLocalStorage(STATS_TIPS_VISIBILITY_KEY, true)

    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.MedianFirstResponseTime]}
            chartId={chartId}
            dashboard={dashboard}
            drillDownMetric={OverviewMetric.MedianFirstResponseTime}
            tip={
                areTipsVisible && (
                    <SupportPerformanceTip
                        metric={MetricName.MedianFirstResponseTime}
                        {...OverviewMetricConfig[
                            OverviewMetric.MedianFirstResponseTime
                        ]}
                    />
                )
            }
        />
    )
}
