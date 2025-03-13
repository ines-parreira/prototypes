import React from 'react'

import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { useDecreaseInResolutionTimeTrend } from 'hooks/reporting/automate/useDecreaseInResolutionTimeTrend'
import { DecreaseInResolutionTimeMetric } from 'pages/automate/automate-metrics'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

export const DecreaseInResolutionTimeKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const decreaseInResolutionTimeTrend = useDecreaseInResolutionTimeTrend(
        statsFilters,
        userTimezone,
    )

    return (
        <DecreaseInResolutionTimeMetric
            trend={decreaseInResolutionTimeTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
