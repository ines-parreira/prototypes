import React from 'react'

import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

export const TicketHandleTimeTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.TicketHandleTime]}
            drillDownMetric={OverviewMetric.TicketHandleTime}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
