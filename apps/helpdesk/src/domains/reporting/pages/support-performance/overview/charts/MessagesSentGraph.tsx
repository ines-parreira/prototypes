import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { OverviewChartCard } from 'domains/reporting/pages/support-performance/components/OverviewChartCard'
import {
    OverviewChartConfig,
    OverviewMetric,
    PERFORMANCE_OVERVIEW_CHART_TYPE,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'

export const MessagesSentGraph = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <OverviewChartCard
            {...OverviewChartConfig[OverviewMetric.MessagesSent]}
            chartType={PERFORMANCE_OVERVIEW_CHART_TYPE}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
