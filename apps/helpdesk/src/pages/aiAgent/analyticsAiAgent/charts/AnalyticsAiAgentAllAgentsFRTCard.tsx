import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentTrendCardDrillDown } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTrendCardDrillDown'

import { useAiAgentAllAgentsFRTTrend } from '../hooks/useAiAgentAllAgentsFRTTrend'

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
    })

    const drillDown = useAiAgentTrendCardDrillDown(
        {
            metricName: AiAgentDrillDownMetricName.AllAgentsFRTCard,
            title: 'First response time',
        },
        trendCardProps.trend.data.value,
    )

    return <TrendCard {...trendCardProps} drillDown={drillDown} />
}
