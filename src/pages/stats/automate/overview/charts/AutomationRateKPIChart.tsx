import React from 'react'

import {useAutomationRateTrend} from 'hooks/reporting/automate/useAutomationRateTrend'

import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import useLocalStorage from 'hooks/useLocalStorage'
import {AutomationRateMetric} from 'pages/automate/automate-metrics'
import {AAO_TIPS_VISIBILITY_KEY} from 'pages/stats/automate/overview/constants'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'

export const AutomationRateKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useLocalStorage(AAO_TIPS_VISIBILITY_KEY, true)
    const {statsFilters, userTimezone} = useNewAutomateFilters()
    const automationRateTrend = useAutomationRateTrend(
        statsFilters,
        userTimezone
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
