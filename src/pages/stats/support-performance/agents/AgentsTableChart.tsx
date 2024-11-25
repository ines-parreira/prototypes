import React from 'react'

import ChartCard from 'pages/stats/ChartCard'
import {AgentsPerformanceCardExtra} from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import {AgentsTableWithDefaultState} from 'pages/stats/support-performance/agents/AgentsTable'

export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'

export const AgentsTableChart = () => {
    return (
        <ChartCard
            title={AGENT_PERFORMANCE_SECTION_TITLE}
            titleExtra={<AgentsPerformanceCardExtra />}
            noPadding
        >
            <AgentsTableWithDefaultState />
        </ChartCard>
    )
}
