import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { useAutomationCostSavedTrend } from 'hooks/reporting/automate/useAutomationCostSavedTrend'
import { AutomationCostSavedMetric } from 'pages/automate/automate-metrics'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

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
