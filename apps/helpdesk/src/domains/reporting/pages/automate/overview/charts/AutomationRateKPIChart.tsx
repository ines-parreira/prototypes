import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { AAO_TIPS_VISIBILITY_KEY } from 'domains/reporting/pages/automate/overview/constants'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import useLocalStorage from 'hooks/useLocalStorage'
import { AutomationRateMetric } from 'pages/automate/automate-metrics'

export const AutomationRateKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useLocalStorage(AAO_TIPS_VISIBILITY_KEY, true)
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automationRateTrend = useAutomationRateTrend(
        statsFilters,
        userTimezone,
    )

    return (
        <AutomationRateMetric
            trend={automationRateTrend}
            showTips={areTipsVisible}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
