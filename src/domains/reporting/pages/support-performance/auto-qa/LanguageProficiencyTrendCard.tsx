import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'

export const LanguageProficiencyTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...TrendCardConfig[AutoQAMetric.LanguageProficiency]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
