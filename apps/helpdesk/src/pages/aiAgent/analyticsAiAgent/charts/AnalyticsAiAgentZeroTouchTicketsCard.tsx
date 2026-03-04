import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentZeroTouchTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentZeroTouchTicketsTrend'

export const AnalyticsAiAgentZeroTouchTicketsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentZeroTouchTicketsTrend,
        isAiAgentTrendCard: true,
    })

    return <TrendCard {...trendCardProps} />
}
