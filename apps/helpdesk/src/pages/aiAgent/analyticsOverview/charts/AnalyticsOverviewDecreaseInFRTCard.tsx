import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { overallDecreaseInFRTTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/overallDecreaseInFirstResponseTime'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentOverviewDecreaseInFRTTrend } from 'pages/aiAgent/analyticsOverview/hooks/useAiAgentOverviewDecreaseInFRTTrend'

export const AnalyticsOverviewDecreaseInFRTCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentOverviewDecreaseInFRTTrend,
        isAiAgentTrendCard: true,
        timeSeriesView: {
            queryFactory: overallDecreaseInFRTTimeseriesQueryV2Factory,
        },
    })

    return <TrendCard {...trendCardProps} />
}
