import React from 'react'

import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { useTimeSavedByAgentsTrend } from 'hooks/reporting/automate/useTimeSavedByAgentsTrend'
import { TimeSavedByAgentsMetric } from 'pages/automate/automate-metrics/TimeSavedByAgentsMetric'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

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
