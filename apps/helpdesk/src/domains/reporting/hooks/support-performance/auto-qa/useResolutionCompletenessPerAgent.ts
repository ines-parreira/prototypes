import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { resolutionCompletenessPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { resolutionCompletenessPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export const useResolutionCompletenessPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimensionV2(
        resolutionCompletenessPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        resolutionCompletenessPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )

export const fetchResolutionCompletenessPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimensionV2(
        resolutionCompletenessPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        resolutionCompletenessPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )
