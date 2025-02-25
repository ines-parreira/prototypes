import React from 'react'

import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const TicketsClosedTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.TicketsClosed]}
            drillDownMetric={OverviewMetric.TicketsClosed}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
