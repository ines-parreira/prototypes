import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAllAgentsFRTTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsFRTTrend'

export const AnalyticsAiAgentAllAgentsFRTCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentAllAgentsFRTTrend,
        isAiAgentTrendCard: true,
        drillDownMetricName: AiAgentDrillDownMetricName.AllAgentsFRTCard,
    })

    return <TrendCard {...trendCardProps} />
}
