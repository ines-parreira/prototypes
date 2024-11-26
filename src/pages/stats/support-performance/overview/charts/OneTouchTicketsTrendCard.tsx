import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const OneTouchTicketsTrendCard = () => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.OneTouchTickets]}
            drillDownMetric={OverviewMetric.OneTouchTickets}
        />
    )
}
