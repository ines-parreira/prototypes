import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {efficiencyPerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/efficiencyQueryFactory'
import {StatsFilters} from 'models/stat/types'

export const useEfficiencyPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        efficiencyPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const fetchEfficiencyPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    fetchMetricPerDimension(
        efficiencyPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )
