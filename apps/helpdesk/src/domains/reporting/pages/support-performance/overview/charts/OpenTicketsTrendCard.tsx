import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'

export const OpenTicketsTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.OpenTickets]}
            drillDownMetric={OverviewMetric.OpenTickets}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
