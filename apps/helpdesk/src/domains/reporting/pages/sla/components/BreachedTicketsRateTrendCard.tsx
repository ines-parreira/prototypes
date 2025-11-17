import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SlaMetricConfig } from 'domains/reporting/pages/sla/SlaConfig'
import { SlaMetric } from 'domains/reporting/state/ui/stats/types'

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
