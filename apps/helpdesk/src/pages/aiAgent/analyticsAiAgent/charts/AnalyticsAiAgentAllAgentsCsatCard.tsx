import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentSupportAgentCsatTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentCsatTrend'

export const AnalyticsAiAgentAllAgentsCsatCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentSupportAgentCsatTrend, // AIAgentCSATCube has no AiAgentRole dimension, same hook covers All Agents scope
        isAiAgentTrendCard: true,
        drillDownMetricName: AiAgentDrillDownMetricName.AllAgentsCsatCard,
    })

    return <TrendCard {...trendCardProps} />
}
