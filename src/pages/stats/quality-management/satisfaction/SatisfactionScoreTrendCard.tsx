import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { SatisfactionMetricConfig } from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SatisfactionMetric } from 'state/ui/stats/types'

export const SatisfactionScoreTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...SatisfactionMetricConfig[SatisfactionMetric.SatisfactionScore]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
