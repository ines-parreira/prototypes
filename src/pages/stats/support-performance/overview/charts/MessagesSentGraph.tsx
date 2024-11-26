import React from 'react'

import {OverviewChartCard} from 'pages/stats/support-performance/components/OverviewChartCard'
import {
    OverviewChartConfig,
    OverviewMetric,
    PERFORMANCE_OVERVIEW_CHART_TYPE,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const MessagesSentGraph = () => {
    return (
        <OverviewChartCard
            {...OverviewChartConfig[OverviewMetric.MessagesSent]}
            chartType={PERFORMANCE_OVERVIEW_CHART_TYPE}
        />
    )
}
