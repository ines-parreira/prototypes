import React from 'react'

import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {useTimeSavedByAgentsTrend} from 'hooks/reporting/automate/useTimeSavedByAgentsTrend'
import {TimeSavedByAgentsMetric} from 'pages/automate/automate-metrics/TimeSavedByAgentsMetric'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'

export const TimeSavedByAgentsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {statsFilters, userTimezone} = useNewAutomateFilters()
    const timeSavedByAgentsTrend = useTimeSavedByAgentsTrend(
        statsFilters,
        userTimezone
    )

    return (
        <TimeSavedByAgentsMetric
            timeSavedByAgentsTrend={timeSavedByAgentsTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
