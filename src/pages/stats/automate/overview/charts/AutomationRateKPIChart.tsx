import React from 'react'

import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { useAutomationRateTrend } from 'hooks/reporting/automate/useAutomationRateTrend'
import useLocalStorage from 'hooks/useLocalStorage'
import { AutomationRateMetric } from 'pages/automate/automate-metrics'
import { AAO_TIPS_VISIBILITY_KEY } from 'pages/stats/automate/overview/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

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
