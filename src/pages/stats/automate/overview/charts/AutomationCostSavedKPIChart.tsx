import React from 'react'

import {useAutomationCostSavedTrend} from 'hooks/reporting/automate/useAutomationCostSavedTrend'

import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {AutomationCostSavedMetric} from 'pages/automate/automate-metrics'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'

export const AutomationCostSavedKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {statsFilters, userTimezone} = useNewAutomateFilters()
    const automationCostSavedTrend = useAutomationCostSavedTrend(
        statsFilters,
        userTimezone
    )

    return (
        <AutomationCostSavedMetric
            dashboard={dashboard}
            chartId={chartId}
            trend={automationCostSavedTrend}
        />
    )
}
