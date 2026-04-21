import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicAllAgentsTimeSavedTimeSeriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAllAgentsTimeSavedMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTimeSavedMetric'

export const AnalyticsAiAgentAllAgentsTimeSavedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentAllAgentsTimeSavedMetric,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory: dynamicAllAgentsTimeSavedTimeSeriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
