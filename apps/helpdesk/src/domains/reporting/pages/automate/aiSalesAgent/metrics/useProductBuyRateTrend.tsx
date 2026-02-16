import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { totalProductBoughtQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentTotalProductBoughtQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalProductRecommendations'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

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
                AISalesAgentTotalProductBoughtQueryFactoryV2({
                    filters,
                    timezone,
                }),
                AISalesAgentTotalProductBoughtQueryFactoryV2({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                }),
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
                AISalesAgentTotalProductBoughtQueryFactoryV2({
                    filters,
                    timezone,
                }),
                AISalesAgentTotalProductBoughtQueryFactoryV2({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                }),
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
