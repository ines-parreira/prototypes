import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
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

    return <TrendCard {...trendCardProps} />
}
