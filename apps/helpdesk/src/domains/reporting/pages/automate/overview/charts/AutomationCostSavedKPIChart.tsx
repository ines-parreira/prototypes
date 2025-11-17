import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationCostSavedTrend } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AutomationCostSavedMetric } from 'pages/automate/automate-metrics'

export const AutomationCostSavedKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automationCostSavedTrend = useAutomationCostSavedTrend(
        statsFilters,
        userTimezone,
    )

    return (
        <AutomationCostSavedMetric
            dashboard={dashboard}
            chartId={chartId}
            trend={automationCostSavedTrend}
        />
    )
}
