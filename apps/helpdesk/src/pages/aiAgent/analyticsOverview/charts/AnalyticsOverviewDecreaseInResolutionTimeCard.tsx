import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { overallDecreaseInResolutionTimeTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/overallDecreaseInResolutionTime'
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
        timeSeriesView: {
            queryFactory:
                overallDecreaseInResolutionTimeTimeseriesQueryV2Factory,
        },
    })

    return <TrendCard {...trendCardProps} />
}
