import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { reviewedClosedTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

export const useReviewedClosedTicketsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        reviewedClosedTicketsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        agentAssigneeId,
    )

export const fetchReviewedClosedTicketsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimension(
        reviewedClosedTicketsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        agentAssigneeId,
    )
