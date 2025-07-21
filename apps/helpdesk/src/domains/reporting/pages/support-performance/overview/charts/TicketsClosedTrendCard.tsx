import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'

export const TicketsClosedTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.TicketsClosed]}
            drillDownMetric={OverviewMetric.TicketsClosed}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
