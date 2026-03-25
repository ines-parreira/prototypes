import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentOrdersInfluencedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOrdersInfluencedTrend'

export const AnalyticsAiAgentOrdersInfluencedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentOrdersInfluencedTrend,
        isAiAgentTrendCard: true,
    })

    return <TrendCard {...trendCardProps} />
}
