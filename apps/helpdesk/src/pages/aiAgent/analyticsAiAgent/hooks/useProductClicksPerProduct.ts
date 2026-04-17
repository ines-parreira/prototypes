import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSalesAgentProductClicksQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignEvents'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useProductClicksPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentProductClicksQueryFactoryV2({
        filters: { period: statsFilters.period },
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchProductClicksPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentProductClicksQueryFactoryV2({
        filters: { period: statsFilters.period },
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
