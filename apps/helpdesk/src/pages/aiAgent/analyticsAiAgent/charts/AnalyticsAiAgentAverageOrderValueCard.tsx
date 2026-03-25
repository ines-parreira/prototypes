import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAverageOrderValueTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAverageOrderValueTrend'

export const AnalyticsAiAgentAverageOrderValueCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentAverageOrderValueTrend,
        isAiAgentTrendCard: true,
    })

    return <TrendCard {...trendCardProps} />
}
