import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { efficiencyPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/efficiencyQueryFactory'
import { efficiencyPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export const useEfficiencyPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimensionV2(
        efficiencyPerAgentQueryFactory(statsFilters, timezone, sorting),
        efficiencyPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )

export const fetchEfficiencyPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimensionV2(
        efficiencyPerAgentQueryFactory(statsFilters, timezone, sorting),
        efficiencyPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )
