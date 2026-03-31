import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAllAgentsSuccessRateTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsSuccessRateTrend'
import { useAiAgentTrendCardDrillDown } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTrendCardDrillDown'

export const AnalyticsAiAgentAllAgentsSuccessRateCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentAllAgentsSuccessRateTrend,
        isAiAgentTrendCard: true,
    })

    const drillDown = useAiAgentTrendCardDrillDown(
        {
            metricName: AiAgentDrillDownMetricName.AllAgentsSuccessRateCard,
            title: 'Success rate',
        },
        trendCardProps.trend.data.value,
    )

    return <TrendCard {...trendCardProps} drillDown={drillDown} />
}
