import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { TimeSavedByAgentsMetric } from 'pages/automate/automate-metrics/TimeSavedByAgentsMetric'

export const TimeSavedByAgentsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const timeSavedByAgentsTrend = useTimeSavedByAgentsTrend(
        statsFilters,
        userTimezone,
    )

    return (
        <TimeSavedByAgentsMetric
            timeSavedByAgentsTrend={timeSavedByAgentsTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
