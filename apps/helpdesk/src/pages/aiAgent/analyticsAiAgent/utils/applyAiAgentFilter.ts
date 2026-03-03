import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const applyAiAgentFilter = (
    filters: StatsFilters,
    aiAgentUserId: number | undefined,
): StatsFilters => ({
    ...filters,
    [FilterKey.Agents]: withDefaultLogicalOperator(
        aiAgentUserId ? [aiAgentUserId] : [],
    ),
})
