import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {reviewedClosedTicketsQueryFactory} from 'models/reporting/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useReviewedClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        reviewedClosedTicketsQueryFactory(filters, timezone),
        reviewedClosedTicketsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const fetchReviewedClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    fetchMetricTrend(
        reviewedClosedTicketsQueryFactory(filters, timezone),
        reviewedClosedTicketsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
