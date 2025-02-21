import React from 'react'

import {useFilteredAutomatedInteractions} from 'hooks/reporting/automate/automationTrends'

import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import useLocalStorage from 'hooks/useLocalStorage'
import {AutomatedInteractionsMetric} from 'pages/automate/automate-metrics'
import {AAO_TIPS_VISIBILITY_KEY} from 'pages/stats/automate/overview/constants'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'

export const AutomatedInteractionsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useLocalStorage(AAO_TIPS_VISIBILITY_KEY, true)
    const {statsFilters, userTimezone} = useNewAutomateFilters()
    const automatedInteractionTrend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone
    )

    return (
        <AutomatedInteractionsMetric
            trend={automatedInteractionTrend}
            showTips={areTipsVisible}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
