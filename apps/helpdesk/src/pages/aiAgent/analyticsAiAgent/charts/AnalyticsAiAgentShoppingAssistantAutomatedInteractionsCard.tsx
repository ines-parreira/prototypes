import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { shoppingAssistantAutomatedInteractionsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentShoppingAssistantAutomatedInteractionsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentShoppingAssistantAutomatedInteractionsTrend'

export const AnalyticsAiAgentShoppingAssistantAutomatedInteractionsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentShoppingAssistantAutomatedInteractionsTrend,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        drillDownMetricName:
            AiAgentDrillDownMetricName.ResolvedInteractionsCard,
        timeSeriesView: {
            queryFactory:
                shoppingAssistantAutomatedInteractionsTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
