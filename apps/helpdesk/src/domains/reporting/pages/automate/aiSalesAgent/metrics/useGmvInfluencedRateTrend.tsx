import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { gmvUSDQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentGMVUsdQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchGmvInfluencedTrendInUSD,
    useGmvInfluencedTrendInUSD,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { calculateRate } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const useGmvInfluencedRateTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            gmvInfluenced: useGmvInfluencedTrendInUSD(filters, timezone),
            gmv: useMetricTrend(
                gmvUSDQueryFactory(filters, timezone),
                gmvUSDQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                ),
                AISalesAgentGMVUsdQueryFactoryV2({ filters, timezone }),
                AISalesAgentGMVUsdQueryFactoryV2({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                }),
            ),
        },
        ({ gmvInfluenced, gmv }) => calculateRate(gmvInfluenced, gmv),
    )

const fetchGmvInfluencedRateTrend = (filters: StatsFilters, timezone: string) =>
    fetchGenericTrend(
        {
            gmvInfluenced: fetchGmvInfluencedTrendInUSD(filters, timezone),
            gmv: fetchMetricTrend(
                gmvUSDQueryFactory(filters, timezone),
                gmvUSDQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                ),
                AISalesAgentGMVUsdQueryFactoryV2({ filters, timezone }),
                AISalesAgentGMVUsdQueryFactoryV2({
                    filters: {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                }),
            ),
        },
        ({ gmvInfluenced, gmv }) => calculateRate(gmvInfluenced, gmv),
    )

export { useGmvInfluencedRateTrend, fetchGmvInfluencedRateTrend }
