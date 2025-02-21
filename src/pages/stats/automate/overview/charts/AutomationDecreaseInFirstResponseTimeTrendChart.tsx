import React from 'react'

import {useDecreaseInFirstResponseTimeTrend} from 'hooks/reporting/automate/useDecreaseInFirstResponseTimeTrend'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {AutomationDecreaseInFirstResponseTimeMetric} from 'pages/automate/automate-metrics'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'

export const AutomationDecreaseInFirstResponseTimeTrendChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {statsFilters, userTimezone} = useNewAutomateFilters()
    const decreaseInFirstResponseTimeTrend =
        useDecreaseInFirstResponseTimeTrend(statsFilters, userTimezone)

    return (
        <AutomationDecreaseInFirstResponseTimeMetric
            trend={decreaseInFirstResponseTimeTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
