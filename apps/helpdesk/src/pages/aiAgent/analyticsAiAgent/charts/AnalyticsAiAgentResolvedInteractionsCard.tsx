import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useResolvedInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useResolvedInteractionsMetric'

export const AnalyticsAiAgentResolvedInteractionsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useResolvedInteractionsMetric,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        drillDownMetricName:
            AiAgentDrillDownMetricName.ResolvedInteractionsCard,
        timeSeriesView: {
            queryFactory:
                dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
