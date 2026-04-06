import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicAverageTimeSavedByAgentTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentTimeSavedMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTimeSavedMetric'

export const AnalyticsAiAgentTimeSavedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentTimeSavedMetric,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory:
                dynamicAverageTimeSavedByAgentTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
