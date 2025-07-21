import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SupportPerformanceTip } from 'domains/reporting/pages/support-performance/components/SupportPerformanceTip'
import {
    OverviewMetric,
    OverviewMetricConfig,
    STATS_TIPS_VISIBILITY_KEY,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { MetricName } from 'domains/reporting/services/constants'
import useLocalStorage from 'hooks/useLocalStorage'

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
