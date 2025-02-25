import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { resolutionCompletenessPerAgentQueryFactory } from 'models/reporting/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { StatsFilters } from 'models/stat/types'

export const useResolutionCompletenessPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        resolutionCompletenessPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        agentAssigneeId,
    )

export const fetchResolutionCompletenessPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimension(
        resolutionCompletenessPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        agentAssigneeId,
    )
