import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SupportPerformanceTip } from 'domains/reporting/pages/support-performance/components/SupportPerformanceTip'
import { useTipsVisibility } from 'domains/reporting/pages/support-performance/overview/hooks/useTipsVisibility'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { MetricName } from 'domains/reporting/services/constants'

const metricConfig =
    OverviewMetricConfig[OverviewMetric.HumanResponseTimeAfterAiHandoff]

export function HumanResponseTimeAfterAiHandoffChart(
    dashboardChartProps: DashboardChartProps,
) {
    const [areTipsVisible] = useTipsVisibility()

    return (
        <TrendCard
            {...metricConfig}
            {...dashboardChartProps}
            drillDownMetric={OverviewMetric.HumanResponseTimeAfterAiHandoff}
            tip={
                areTipsVisible && (
                    <SupportPerformanceTip
                        metric={MetricName.HumanResponseTimeAfterAiHandoff}
                        {...metricConfig}
                    />
                )
            }
        />
    )
}
