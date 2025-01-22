import React from 'react'

import ChartCard from 'pages/stats/ChartCard'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import {AGENT_PERFORMANCE_SECTION_TITLE} from 'pages/stats/support-performance/agents/AgentsTableChart'
import {AutoQAAgentsCardExtra} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsCardExtra'
import {AutoQAAgentsTable} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTable'

export const AUTO_QA_TITLE_TOOLTIP =
    "An agent receives the ticket's scores if they are the assigned agent at the end of the period"

export const AutoQaAgentsTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <ChartCard
            chartId={chartId}
            dashboard={dashboard}
            title={AGENT_PERFORMANCE_SECTION_TITLE}
            hint={{title: AUTO_QA_TITLE_TOOLTIP}}
            titleExtra={<AutoQAAgentsCardExtra />}
            noPadding
        >
            <AutoQAAgentsTable />
        </ChartCard>
    )
}
