import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAutomatedInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsMetric'

export const AnalyticsAiAgentAutomatedInteractionsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentAutomatedInteractionsMetric,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        drillDownMetricName:
            AiAgentDrillDownMetricName.AutomatedInteractionsCard,
    })

    return <TrendCard {...trendCardProps} />
}
