import { formatMetricValue, TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

import { useAiAgentSupportCostSaved } from '../hooks/useAiAgentSupportCostSaved'

export const AnalyticsAiAgentSupportCostSavedCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )
    const trendCardProps = useReportingTrendCardProps({
        useTrend: useAiAgentSupportCostSaved,
        chartConfig: chartConfig!,
        chartId,
        isAiAgentTrendCard: true,
        dashboard,
        timeSeriesView: {
            queryFactory:
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2,
            valueFormatter: (value: number) =>
                formatMetricValue(
                    costSavedPerInteraction * (value ?? 0),
                    'currency-precision-1',
                ),
        },
    })

    return <TrendCard {...trendCardProps} />
}
