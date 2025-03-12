import React from 'react'

import { useDecreaseInResolutionTimeTrend } from 'hooks/reporting/automate/useDecreaseInResolutionTimeTrend'
import { useNewAutomateFilters } from 'hooks/reporting/automate/useNewAutomateFilters'
import { DecreaseInResolutionTimeMetric } from 'pages/automate/automate-metrics'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

export const DecreaseInResolutionTimeKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useNewAutomateFilters()
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
