import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicConversionRateTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiSalesAgentConversionRateTrend } from 'pages/aiAgent/analyticsAiAgent/charts/useAiSalesAgentConversionRateTrend'

export const AnalyticsAiAgentConversionRateCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        chartConfig: chartConfig!,
        chartId,
        dashboard,
        useTrend: useAiSalesAgentConversionRateTrend,
        isAiAgentTrendCard: true,
        timeSeriesView: {
            queryFactory: dynamicConversionRateTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
