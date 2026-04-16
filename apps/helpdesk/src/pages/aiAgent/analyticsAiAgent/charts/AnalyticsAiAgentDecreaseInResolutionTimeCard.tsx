import { TrendCard } from '@repo/reporting'

import { useAiAgentAllAgentsDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useAiAgentAllAgentsDecreaseInResolutionTimeTrend'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentDecreaseInResolutionTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentAllAgentsDecreaseInResolutionTimeTrend,
        isAiAgentTrendCard: true,
        drillDownMetricName:
            AiAgentDrillDownMetricName.AllAgentsResolutionTimeCard,
    })

    return <TrendCard {...trendCardProps} />
}
