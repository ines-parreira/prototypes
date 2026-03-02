import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AgentAvailabilityTable } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTable'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import useAppSelector from 'hooks/useAppSelector'

export const AgentAvailabilityTableWithDefaultState = () => {
    const allAgents = useAppSelector(getFilteredAgents)
    const statsFilters = useStatsFilters()

    return (
        <AgentAvailabilityTable
            allAgents={allAgents}
            statsFilters={statsFilters}
        />
    )
}
