import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalNumberProductRecommendationsQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useTotalProductRecommendations = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        totalNumberProductRecommendationsQueryFactory(filters, timezone),
        totalNumberProductRecommendationsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchTotalProductRecommendations = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        totalNumberProductRecommendationsQueryFactory(filters, timezone),
        totalNumberProductRecommendationsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export { useTotalProductRecommendations, fetchTotalProductRecommendations }
