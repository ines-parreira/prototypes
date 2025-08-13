import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    AI_AGENT_AUTOMATION_RATE_LABEL,
    AI_AGENT_AUTOMATION_RATE_TOOLTIP,
} from 'pages/automate/automate-metrics/constants'
import { getTrendPropsToPercent } from 'pages/automate/automate-metrics/utils'

export const AIAgentAutomationRateKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const aiAgentAutomationRateTrend = useAIAgentAutomationRateTrend(
        statsFilters,
        userTimezone,
    )

    return (
        <MetricCard
            title={AI_AGENT_AUTOMATION_RATE_LABEL}
            hint={AI_AGENT_AUTOMATION_RATE_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
            isLoading={aiAgentAutomationRateTrend.isFetching}
        >
            <BigNumberMetric
                isLoading={aiAgentAutomationRateTrend.isFetching}
                trendBadge={
                    <TrendBadge
                        {...getTrendPropsToPercent(aiAgentAutomationRateTrend)}
                    />
                }
            >
                {formatMetricValue(
                    aiAgentAutomationRateTrend.data?.value,
                    'decimal-to-percent',
                )}
            </BigNumberMetric>
        </MetricCard>
    )
}
