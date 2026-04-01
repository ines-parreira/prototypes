import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentSupportAgentSuccessRateTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentSuccessRateTrend'

export const AnalyticsAiAgentSupportAgentSuccessRateCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentSupportAgentSuccessRateTrend,
        isAiAgentTrendCard: true,
        drillDownMetricName:
            AiAgentDrillDownMetricName.SupportAgentSuccessRateCard,
    })

    return <TrendCard {...trendCardProps} />
}
