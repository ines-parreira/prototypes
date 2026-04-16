import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentOverviewDecreaseInResolutionTimeTrend } from 'pages/aiAgent/analyticsOverview/hooks/useAiAgentOverviewDecreaseInResolutionTimeTrend'

export const AnalyticsOverviewDecreaseInResolutionTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentOverviewDecreaseInResolutionTimeTrend,
        isAiAgentTrendCard: true,
    })

    return <TrendCard {...trendCardProps} />
}
