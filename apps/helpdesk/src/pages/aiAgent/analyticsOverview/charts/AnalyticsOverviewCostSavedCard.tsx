import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useCostSavedMetric } from 'pages/aiAgent/analyticsOverview/hooks/useCostSavedMetric'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const AnalyticsOverviewCostSavedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useCostSavedMetric,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory:
                dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2,
            valueTransform: (value: number | null) =>
                costSavedPerInteraction * (value ?? 0),
        },
    })

    return <TrendCard {...trendCardProps} />
}
