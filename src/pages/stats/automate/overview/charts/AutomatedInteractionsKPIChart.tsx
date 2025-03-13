import React from 'react'

import { useFilteredAutomatedInteractions } from 'hooks/reporting/automate/automationTrends'
import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import useLocalStorage from 'hooks/useLocalStorage'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics'
import { AAO_TIPS_VISIBILITY_KEY } from 'pages/stats/automate/overview/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

export const AutomatedInteractionsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useLocalStorage(AAO_TIPS_VISIBILITY_KEY, true)
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automatedInteractionTrend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
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
