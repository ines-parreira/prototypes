import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { gmvQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { calculateRate } from 'pages/stats/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'utils/reporting'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from './useGmvInfluencedTrend'

const useGmvInfluencedRateTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            gmvInfluenced: useGmvInfluencedTrend(filters, timezone),
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
            gmvInfluenced: fetchGmvInfluencedTrend(filters, timezone),
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
