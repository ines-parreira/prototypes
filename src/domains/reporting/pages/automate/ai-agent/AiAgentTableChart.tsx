import { UserRole } from 'config/types/user'
import { AiAgentTable } from 'domains/reporting/pages/automate/ai-agent/AiAgentTable'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AgentsEditColumns } from 'domains/reporting/pages/support-performance/agents/AgentsEditColumns'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'domains/reporting/pages/support-performance/agents/AgentsTableChart'
import useAppSelector from 'hooks/useAppSelector'
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
