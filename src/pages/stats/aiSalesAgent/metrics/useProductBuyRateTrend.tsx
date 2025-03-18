import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalProductBoughtQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'
import { getPreviousPeriod } from 'utils/reporting'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from './useTotalProductRecommendations'

const useProductBuyRateTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            totalProductBought: useMetricTrend(
                totalProductBoughtQueryFactory(filters, timezone),
                totalProductBoughtQueryFactory(
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
        ({ totalProductBought, totalRecommendations }) =>
            safeDivide(totalProductBought, totalRecommendations) * 100,
    )

const fetchProductBuyRateTrend = (filters: StatsFilters, timezone: string) =>
    fetchGenericTrend(
        {
            totalProductBought: fetchMetricTrend(
                totalProductBoughtQueryFactory(filters, timezone),
                totalProductBoughtQueryFactory(
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
        ({ totalProductBought, totalRecommendations }) =>
            safeDivide(totalProductBought, totalRecommendations) * 100,
    )

export { useProductBuyRateTrend, fetchProductBuyRateTrend }
