import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicOrdersInfluencedCountTimeSeriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentOrdersInfluencedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOrdersInfluencedTrend'

export const AnalyticsAiAgentOrdersInfluencedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiAgentOrdersInfluencedTrend,
        isAiAgentTrendCard: true,
        timeSeriesView: {
            queryFactory: dynamicOrdersInfluencedCountTimeSeriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
