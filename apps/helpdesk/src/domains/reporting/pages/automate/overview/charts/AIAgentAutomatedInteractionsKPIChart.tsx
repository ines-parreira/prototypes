import { useAIAgentAutomatedInteractionsTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    AI_AGENT_AUTOMATED_INTERACTIONS_COUNT_LABEL,
    AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP,
} from 'pages/automate/automate-metrics/constants'
import { getTrendProps } from 'pages/automate/automate-metrics/utils'

export const AIAgentAutomatedInteractionsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const aiAgentAutomatedInteractionsTrend =
        useAIAgentAutomatedInteractionsTrend(statsFilters, userTimezone)

    return (
        <MetricCard
            title={AI_AGENT_AUTOMATED_INTERACTIONS_COUNT_LABEL}
            hint={AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
            isLoading={aiAgentAutomatedInteractionsTrend.isFetching}
        >
            <BigNumberMetric
                isLoading={aiAgentAutomatedInteractionsTrend.isFetching}
                trendBadge={
                    <TrendBadge
                        {...getTrendProps(aiAgentAutomatedInteractionsTrend)}
                    />
                }
            >
                {formatMetricValue(
                    aiAgentAutomatedInteractionsTrend.data?.value,
                )}
            </BigNumberMetric>
        </MetricCard>
    )
}
