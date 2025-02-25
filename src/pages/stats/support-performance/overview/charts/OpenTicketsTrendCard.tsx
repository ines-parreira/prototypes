import React from 'react'

import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const OpenTicketsTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.OpenTickets]}
            drillDownMetric={OverviewMetric.OpenTickets}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
