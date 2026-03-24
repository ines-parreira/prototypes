import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentClosedTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentClosedTicketsTrend'
import { useAiAgentTrendCardDrillDown } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTrendCardDrillDown'

export const AnalyticsAiAgentClosedTicketsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentClosedTicketsTrend,
        isAiAgentTrendCard: true,
    })

    const drillDown = useAiAgentTrendCardDrillDown(
        {
            metricName: AiAgentDrillDownMetricName.AllAgentsClosedTicketsCard,
            title: 'Closed tickets',
        },
        trendCardProps.trend.data.value,
    )

    return <TrendCard {...trendCardProps} drillDown={drillDown} />
}
