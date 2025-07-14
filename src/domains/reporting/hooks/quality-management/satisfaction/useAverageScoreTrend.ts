import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { averageScoreQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/averageScoreQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAverageScoreTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        averageScoreQueryFactory(filters, timezone),
        averageScoreQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchAverageScoreTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        averageScoreQueryFactory(filters, timezone),
        averageScoreQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
