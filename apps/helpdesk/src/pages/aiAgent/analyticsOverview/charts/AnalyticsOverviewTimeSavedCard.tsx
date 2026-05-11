import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicMedianTimeSavedByAgentTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useOverallTimeSavedByAgentsTrend } from 'pages/aiAgent/analyticsOverview/hooks/useOverallTimeSavedByAgentsTrend'

export const AnalyticsOverviewTimeSavedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useOverallTimeSavedByAgentsTrend,
        // The chartConfig and chartId are optional in the hook, but we know they will be provided in this context(DashboardLayoutRenderer)
        // so we can assert them as non-null with the ! operator.
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory: dynamicMedianTimeSavedByAgentTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
