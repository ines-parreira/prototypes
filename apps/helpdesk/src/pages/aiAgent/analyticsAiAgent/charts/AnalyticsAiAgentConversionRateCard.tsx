import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { useConversionRateTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useConversionRateTrend'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsAiAgentConversionRateCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useConversionRateTrend,
        isAiAgentTrendCard: true,
    })

    return <TrendCard {...trendCardProps} />
}
