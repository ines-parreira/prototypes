import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentSupportAgentAutomatedInteractionsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentAutomatedInteractionsTrend'

export const AnalyticsAiAgentSupportAgentAutomatedInteractionsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentSupportAgentAutomatedInteractionsTrend,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        drillDownMetricName: AiAgentDrillDownMetricName.SupportInteractionsCard,
        timeSeriesView: {
            queryFactory:
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
