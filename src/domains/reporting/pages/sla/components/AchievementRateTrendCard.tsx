import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SlaMetricConfig } from 'domains/reporting/pages/sla/SlaConfig'
import { SlaMetric } from 'domains/reporting/state/ui/stats/types'

export const AchievementRateTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...SlaMetricConfig[SlaMetric.AchievementRate]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
