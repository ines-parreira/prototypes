import { TrendCard } from '@repo/reporting'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { useSuccessRateTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentSuccessRateSalesCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useSuccessRateTrend,
        isAiAgentTrendCard: true,
    })

    const drillDown = useDrillDownModalTrigger({
        metricName: AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard,
        title: 'Success rate',
    })

    return <TrendCard {...trendCardProps} drillDown={drillDown} />
}
