import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const TicketHandleTimeTrendCard = () => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.TicketHandleTime]}
            drillDownMetric={OverviewMetric.TicketHandleTime}
        />
    )
}
