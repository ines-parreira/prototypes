import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SupportPerformanceTip } from 'domains/reporting/pages/support-performance/components/SupportPerformanceTip'
import { useTipsVisibility } from 'domains/reporting/pages/support-performance/overview/hooks/useTipsVisibility'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { MetricName } from 'domains/reporting/services/constants'

export const MedianResolutionTimeTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useTipsVisibility()

    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.MedianResolutionTime]}
            chartId={chartId}
            dashboard={dashboard}
            drillDownMetric={OverviewMetric.MedianResolutionTime}
            tip={
                areTipsVisible && (
                    <SupportPerformanceTip
                        {...OverviewMetricConfig[
                            OverviewMetric.MedianResolutionTime
                        ]}
                        metric={MetricName.MedianResolutionTime}
                    />
                )
            }
        />
    )
}
