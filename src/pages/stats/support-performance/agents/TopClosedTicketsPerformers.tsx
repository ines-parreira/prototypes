import React from 'react'

import {DashboardChartProps} from 'pages/stats/custom-reports/types'

import AgentsShoutOut from 'pages/stats/support-performance/agents/AgentsShoutOut'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'

export const TopClosedTicketsPerformers = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const config =
        AgentsShoutOutsConfig[TopPerformersChart.TopClosedTicketsPerformers]
    return (
        <AgentsShoutOut {...config} chartId={chartId} dashboard={dashboard} />
    )
}
