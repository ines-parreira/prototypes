import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAllAgentsAverageCsatTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAverageCsatTrend'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const AnalyticsAiAgentAllAgentsAverageCsatCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentAllAgentsAverageCsatTrend,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        drillDownMetricName: AiAgentDrillDownMetricName.AllAgentsCsatCard,
        outcomeCustomFieldId,
    })

    return <TrendCard {...trendCardProps} />
}
