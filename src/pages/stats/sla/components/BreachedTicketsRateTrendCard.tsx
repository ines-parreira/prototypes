import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { SlaMetricConfig } from 'pages/stats/sla/SlaConfig'
import { SlaMetric } from 'state/ui/stats/types'

export const BreachedTicketsRateTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...SlaMetricConfig[SlaMetric.BreachedTicketsRate]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
