import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { OverviewChartCard } from 'pages/stats/support-performance/components/OverviewChartCard'
import {
    OverviewChartConfig,
    OverviewMetric,
    PERFORMANCE_OVERVIEW_CHART_TYPE,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

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
