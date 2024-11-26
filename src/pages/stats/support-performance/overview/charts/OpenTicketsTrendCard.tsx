import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const OpenTicketsTrendCard = () => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.OpenTickets]}
            drillDownMetric={OverviewMetric.OpenTickets}
        />
    )
}
