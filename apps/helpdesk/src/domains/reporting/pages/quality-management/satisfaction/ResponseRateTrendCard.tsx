import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SatisfactionMetricConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SatisfactionMetric } from 'domains/reporting/state/ui/stats/types'

export const ResponseRateTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...SatisfactionMetricConfig[SatisfactionMetric.ResponseRate]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
