import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAllAgentsCostSavedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsCostSavedTrend'

export const AnalyticsAiAgentCostSavedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentAllAgentsCostSavedTrend,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
    })

    return <TrendCard {...trendCardProps} />
}
