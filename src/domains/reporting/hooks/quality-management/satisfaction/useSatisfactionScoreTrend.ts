import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { satisfactionScoreQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/satisfactionScoreQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useSatisfactionScoreTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        satisfactionScoreQueryFactory(filters, timezone),
        satisfactionScoreQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchSatisfactionScoreTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        satisfactionScoreQueryFactory(filters, timezone),
        satisfactionScoreQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
