import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { TrendCardConfig } from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import { AutoQAMetric } from 'state/ui/stats/types'

export const InternalComplianceTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...TrendCardConfig[AutoQAMetric.InternalCompliance]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
