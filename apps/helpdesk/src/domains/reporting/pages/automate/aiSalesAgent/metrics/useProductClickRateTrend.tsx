import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { totalProductClicksQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { aiSalesAgentUniqueClicksQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignEvents'
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
                aiSalesAgentUniqueClicksQueryFactoryV2({ filters, timezone }),
                aiSalesAgentUniqueClicksQueryFactoryV2({
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
                aiSalesAgentUniqueClicksQueryFactoryV2({ filters, timezone }),
                aiSalesAgentUniqueClicksQueryFactoryV2({
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
        ({ totalProductClicks, totalRecommendations }) =>
            safeDivide(totalProductClicks, totalRecommendations) * 100,
    )

export { useProductClickRateTrend, fetchProductClickRateTrend }
