import React from 'react'

import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentTable } from 'pages/stats/automate/ai-agent/AiAgentTable'
import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { AgentsEditColumns } from 'pages/stats/support-performance/agents/AgentsEditColumns'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'pages/stats/support-performance/agents/AgentsTableChart'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export function AiAgentTableChart({ chartId, dashboard }: DashboardChartProps) {
    const currentUser = useAppSelector(getCurrentUser)

    const isAdmin = hasRole(currentUser, UserRole.Admin)

    return (
        <ChartCard
            title={AGENT_PERFORMANCE_SECTION_TITLE}
            titleExtra={isAdmin && <AgentsEditColumns />}
            noPadding
            chartId={chartId}
            dashboard={dashboard}
        >
            <AiAgentTable />
        </ChartCard>
    )
}
