import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSalesRecommendedProductCountPerProductQueryFactoryV2 as aiSalesTimesRecommendedQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useTimesRecommendedPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesTimesRecommendedQueryFactoryV2({
        filters: { period: statsFilters.period },
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchTimesRecommendedPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesTimesRecommendedQueryFactoryV2({
        filters: { period: statsFilters.period },
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
