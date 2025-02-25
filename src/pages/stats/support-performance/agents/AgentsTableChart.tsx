import React from 'react'

import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { AgentsPerformanceCardExtra } from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import { AgentsTableWithDefaultState } from 'pages/stats/support-performance/agents/AgentsTable'

export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'

export const AgentsTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <ChartCard
            title={AGENT_PERFORMANCE_SECTION_TITLE}
            titleExtra={<AgentsPerformanceCardExtra />}
            chartId={chartId}
            dashboard={dashboard}
            noPadding
        >
            <AgentsTableWithDefaultState />
        </ChartCard>
    )
}
