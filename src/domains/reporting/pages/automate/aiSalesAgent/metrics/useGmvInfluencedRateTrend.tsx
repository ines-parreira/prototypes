import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { gmvQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'domains/reporting/models/stat/types'
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
                gmvQueryFactory(filters, timezone),
                gmvQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                ),
            ),
        },
        ({ gmvInfluenced, gmv }) => calculateRate(gmvInfluenced, gmv),
    )

const fetchGmvInfluencedRateTrend = (filters: StatsFilters, timezone: string) =>
    fetchGenericTrend(
        {
            gmvInfluenced: fetchGmvInfluencedTrendInUSD(filters, timezone),
            gmv: fetchMetricTrend(
                gmvQueryFactory(filters, timezone),
                gmvQueryFactory(
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    timezone,
                ),
            ),
        },
        ({ gmvInfluenced, gmv }) => calculateRate(gmvInfluenced, gmv),
    )

export { useGmvInfluencedRateTrend, fetchGmvInfluencedRateTrend }
