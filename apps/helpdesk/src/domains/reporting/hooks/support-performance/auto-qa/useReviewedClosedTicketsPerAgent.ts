import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { reviewedClosedTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import { reviewedClosedTicketsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export const useReviewedClosedTicketsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimensionV2(
        reviewedClosedTicketsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        reviewedClosedTicketsPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )

export const fetchReviewedClosedTicketsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimensionV2(
        reviewedClosedTicketsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        reviewedClosedTicketsPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )
