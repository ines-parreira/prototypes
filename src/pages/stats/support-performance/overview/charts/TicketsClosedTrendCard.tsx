import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const TicketsClosedTrendCard = () => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.TicketsClosed]}
            drillDownMetric={OverviewMetric.TicketsClosed}
        />
    )
}
