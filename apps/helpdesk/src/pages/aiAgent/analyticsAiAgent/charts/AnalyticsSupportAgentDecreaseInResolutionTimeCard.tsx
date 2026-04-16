import { TrendCard } from '@repo/reporting'

import { useAiAgentSupportAgentDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useAiAgentSupportAgentDecreaseInResolutionTimeTrend'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsSupportAgentDecreaseInResolutionTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentSupportAgentDecreaseInResolutionTimeTrend,
        isAiAgentTrendCard: true,
        drillDownMetricName:
            AiAgentDrillDownMetricName.SupportAgentResolutionTimeCard,
    })

    return <TrendCard {...trendCardProps} />
}
