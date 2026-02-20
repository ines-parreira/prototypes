import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { totalNumberProductRecommendationsQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentTotalProductRecommendationsQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentConversations'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

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
        AISalesAgentTotalProductRecommendationsQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesAgentTotalProductRecommendationsQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
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
        AISalesAgentTotalProductRecommendationsQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesAgentTotalProductRecommendationsQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export { useTotalProductRecommendations, fetchTotalProductRecommendations }
