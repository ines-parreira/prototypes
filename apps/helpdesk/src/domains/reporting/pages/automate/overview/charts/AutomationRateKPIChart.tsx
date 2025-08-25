import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AutomationRateMetric } from 'pages/automate/automate-metrics'
import { OVERALL_AUTOMATION_RATE_LABEL } from 'pages/automate/automate-metrics/constants'

export const AutomationRateKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automationRateTrend = useAutomationRateTrend(
        statsFilters,
        userTimezone,
    )

    return (
        <AutomationRateMetric
            title={OVERALL_AUTOMATION_RATE_LABEL}
            trend={automationRateTrend}
            showTips={false}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
