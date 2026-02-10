import { UserRole } from 'config/types/user'
import { AiAgentTable } from 'domains/reporting/pages/automate/ai-agent/AiAgentTable'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AgentsEditColumns } from 'domains/reporting/pages/support-performance/agents/AgentsEditColumns'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export function AiAgentTableChart({ chartId, dashboard }: DashboardChartProps) {
    const currentUser = useAppSelector(getCurrentUser)

    const isAdmin = hasRole(currentUser, UserRole.Admin)

    return (
        <ChartCard
            title={SECTION_TITLES.AGENT_PERFORMANCE}
            titleExtra={isAdmin && <AgentsEditColumns />}
            noPadding
            chartId={chartId}
            dashboard={dashboard}
        >
            <AiAgentTable />
        </ChartCard>
    )
}
