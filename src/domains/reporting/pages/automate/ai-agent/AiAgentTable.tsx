import { User } from 'config/types/user'
import { useAIAgentUser } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { AgentsTable } from 'domains/reporting/pages/support-performance/agents/AgentsTable'

export const AiAgentTable = () => {
    const statsFilters = useStatsFilters()
    const aiAgentUser = useAIAgentUser()
    const users = aiAgentUser ? [aiAgentUser] : []
    const cleanStatsFilters = {
        ...statsFilters.cleanStatsFilters,
        [FilterKey.Agents]: withDefaultLogicalOperator(
            users.map((user) => Number(user.id)),
        ),
    } as StatsFiltersWithLogicalOperator

    const paginatedAgents: {
        currentPage: number
        perPage: number
        agents: User[]
        allAgents: User[]
    } = {
        currentPage: 1,
        perPage: 1,
        agents: users,
        allAgents: users,
    }
    return (
        <AgentsTable
            paginatedAgents={paginatedAgents}
            statsFilters={{ ...statsFilters, cleanStatsFilters }}
            withAggregateRows={false}
            isHeatmapMode={false}
        />
    )
}
