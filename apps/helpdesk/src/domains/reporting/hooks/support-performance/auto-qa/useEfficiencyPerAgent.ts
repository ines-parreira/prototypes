import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { efficiencyPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/efficiencyQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

export const useEfficiencyPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        efficiencyPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId,
    )

export const fetchEfficiencyPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimension(
        efficiencyPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId,
    )
