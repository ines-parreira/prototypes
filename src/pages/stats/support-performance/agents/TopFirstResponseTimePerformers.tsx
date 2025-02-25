import React from 'react'

import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import AgentsShoutOut from 'pages/stats/support-performance/agents/AgentsShoutOut'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'

export const TopFirstResponseTimePerformers = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const config =
        AgentsShoutOutsConfig[TopPerformersChart.TopFirstResponseTimePerformers]
    return (
        <AgentsShoutOut {...config} chartId={chartId} dashboard={dashboard} />
    )
}
