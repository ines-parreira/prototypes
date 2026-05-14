import { TrendCard } from '@repo/reporting'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentClosedTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentClosedTicketsTrend'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const AnalyticsAiAgentClosedTicketsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()
    const aiAgentUserId = useAIAgentUserId()

    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentClosedTicketsTrend,
        isAiAgentTrendCard: true,
        drillDownMetricName:
            AiAgentDrillDownMetricName.AllAgentsClosedTicketsCard,
        outcomeCustomFieldId,
        assigneeUserId: aiAgentUserId,
    })

    return <TrendCard {...trendCardProps} />
}
