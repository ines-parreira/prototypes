import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAllAgentsDecreaseInFRTTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsDecreaseInFRTTrend'

export const AnalyticsAiAgentAllAgentsDecreaseInFRTCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentAllAgentsDecreaseInFRTTrend,
        isAiAgentTrendCard: true,
        drillDownMetricName: AiAgentDrillDownMetricName.AllAgentsFRTCard,
    })

    return <TrendCard {...trendCardProps} />
}
