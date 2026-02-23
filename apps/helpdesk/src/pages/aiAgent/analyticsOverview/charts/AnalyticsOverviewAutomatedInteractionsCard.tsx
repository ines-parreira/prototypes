import { TrendCard } from '@repo/reporting'

import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const AnalyticsOverviewAutomatedInteractionsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useFilteredAutomatedInteractions,
        // The chartConfig and chartId are optional in the hook, but we know they will be provided in this context(DashboardLayoutRenderer)
        // so we can assert them as non-null with the ! operator.
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
    })

    return <TrendCard {...trendCardProps} />
}
