import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicOverallAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAutomationRateMetric } from 'pages/aiAgent/analyticsOverview/hooks/useAutomationRateMetric'

export const AnalyticsOverviewAutomationRateCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAutomationRateMetric,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory: dynamicOverallAutomationRateQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
