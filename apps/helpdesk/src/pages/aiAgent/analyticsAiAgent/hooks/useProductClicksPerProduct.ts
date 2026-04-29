import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSalesAgentProductClicksQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignEvents'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useProductClicksPerProduct = (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentProductClicksQueryFactoryV2({
        filters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchProductClicksPerProduct = (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentProductClicksQueryFactoryV2({
        filters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
