import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SatisfactionMetricConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SatisfactionMetric } from 'domains/reporting/state/ui/stats/types'

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
