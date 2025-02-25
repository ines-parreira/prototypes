import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { reviewedClosedTicketsPerAgentQueryFactory } from 'models/reporting/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import { StatsFilters } from 'models/stat/types'

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
