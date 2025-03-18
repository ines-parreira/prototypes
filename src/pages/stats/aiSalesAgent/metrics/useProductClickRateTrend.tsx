import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalProductClicksQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'
import { getPreviousPeriod } from 'utils/reporting'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from './useTotalProductRecommendations'

const useProductClickRateTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            totalProductClicks: useMetricTrend(
                totalProductClicksQueryFactory(filters, timezone),
                totalProductClicksQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                ),
            ),
            totalRecommendations: useTotalProductRecommendations(
                filters,
                timezone,
            ),
        },
        ({ totalProductClicks, totalRecommendations }) =>
            safeDivide(totalProductClicks, totalRecommendations) * 100,
    )

const fetchProductClickRateTrend = (filters: StatsFilters, timezone: string) =>
    fetchGenericTrend(
        {
            totalProductClicks: fetchMetricTrend(
                totalProductClicksQueryFactory(filters, timezone),
                totalProductClicksQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                ),
            ),
            totalRecommendations: fetchTotalProductRecommendations(
                filters,
                timezone,
            ),
        },
        ({ totalProductClicks, totalRecommendations }) =>
            safeDivide(totalProductClicks, totalRecommendations) * 100,
    )

export { useProductClickRateTrend, fetchProductClickRateTrend }
