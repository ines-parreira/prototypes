import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {averageScoreQueryFactory} from 'models/reporting/queryFactories/satisfaction/averageScoreQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useAverageScoreTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        averageScoreQueryFactory(filters, timezone),
        averageScoreQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const fetchAverageScoreTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    fetchMetricTrend(
        averageScoreQueryFactory(filters, timezone),
        averageScoreQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
