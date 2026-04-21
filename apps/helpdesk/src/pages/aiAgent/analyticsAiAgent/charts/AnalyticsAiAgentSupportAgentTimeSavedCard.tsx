import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { averageTimeSavedSupportAgentTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentSupportAgentTimeSavedMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentTimeSavedMetric'

export const AnalyticsAiAgentSupportAgentTimeSavedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentSupportAgentTimeSavedMetric,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory: averageTimeSavedSupportAgentTimeseriesQueryV2Factory,
        },
    })

    return <TrendCard {...trendCardProps} />
}
