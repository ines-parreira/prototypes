import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { satisfactionScoreQueryFactory } from 'models/reporting/queryFactories/satisfaction/satisfactionScoreQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

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
