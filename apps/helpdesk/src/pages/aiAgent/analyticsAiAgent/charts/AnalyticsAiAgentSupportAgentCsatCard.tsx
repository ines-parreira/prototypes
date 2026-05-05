import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentSupportAgentAverageCsatTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentAverageCsatTrend'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const AnalyticsAiAgentSupportAgentCsatCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentSupportAgentAverageCsatTrend,
        isAiAgentTrendCard: true,
        drillDownMetricName: AiAgentDrillDownMetricName.SupportAgentCsatCard,
        outcomeCustomFieldId,
    })

    return <TrendCard {...trendCardProps} />
}
