import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { allAgentsAutomatedInteractionsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useAiAgentAllAgentsAutomatedInteractionsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomatedInteractionsTrend'

export const AnalyticsAiAgentAllAgentsAutomatedInteractionsCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentAllAgentsAutomatedInteractionsTrend,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        drillDownMetricName:
            AiAgentDrillDownMetricName.AutomatedInteractionsCard,
        timeSeriesView: {
            queryFactory:
                allAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
