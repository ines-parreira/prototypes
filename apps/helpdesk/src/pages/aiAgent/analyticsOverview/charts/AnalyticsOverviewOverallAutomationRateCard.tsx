import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicOverallAutomationRateTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useOverallAutomationRateTrend } from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRateTrend'

export const AnalyticsOverviewOverallAutomationRateCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useOverallAutomationRateTrend,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory: dynamicOverallAutomationRateTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
