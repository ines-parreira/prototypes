import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import useAppSelector from 'hooks/useAppSelector'

import { AgentAvailabilityTable } from './AgentAvailabilityTable'

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
