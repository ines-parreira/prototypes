import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'

export const AccuracyTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...TrendCardConfig[AutoQAMetric.Accuracy]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
