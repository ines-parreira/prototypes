import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { useTotalProductRecommendations } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentProductRecommendationsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useTotalProductRecommendations,
        isAiAgentTrendCard: true,
    })

    return <TrendCard {...trendCardProps} />
}
