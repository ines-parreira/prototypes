import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentMedianPurchaseTimeTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentMedianPurchaseTimeTrend'

export const AnalyticsAiAgentMedianPurchaseTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentMedianPurchaseTimeTrend,
        isAiAgentTrendCard: true,
    })

    return <TrendCard {...trendCardProps} />
}
