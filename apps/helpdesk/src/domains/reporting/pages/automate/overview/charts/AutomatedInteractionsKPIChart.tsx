import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics'
import { OVERALL_AUTOMATED_INTERACTIONS_LABEL } from 'pages/automate/automate-metrics/constants'

export const AutomatedInteractionsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automatedInteractionTrend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
    )

    return (
        <AutomatedInteractionsMetric
            title={OVERALL_AUTOMATED_INTERACTIONS_LABEL}
            trend={automatedInteractionTrend}
            showTips={false}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
