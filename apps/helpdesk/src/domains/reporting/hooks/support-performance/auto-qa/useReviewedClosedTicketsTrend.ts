import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { reviewedClosedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useReviewedClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        reviewedClosedTicketsQueryFactory(filters, timezone),
        reviewedClosedTicketsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchReviewedClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        reviewedClosedTicketsQueryFactory(filters, timezone),
        reviewedClosedTicketsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
