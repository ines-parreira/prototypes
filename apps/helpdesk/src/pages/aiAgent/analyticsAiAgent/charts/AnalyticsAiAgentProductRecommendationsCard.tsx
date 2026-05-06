import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentProductRecommendationsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentProductRecommendationsTrend'

export const AnalyticsAiAgentProductRecommendationsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentProductRecommendationsTrend,
        isAiAgentTrendCard: true,
        drillDownMetricName:
            AiAgentDrillDownMetricName.ShoppingAssistantProductRecommendationsCard,
    })

    return <TrendCard {...trendCardProps} />
}
