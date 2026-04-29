import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSalesAgentBuyThroughRatePerProductQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentBuyThroughRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useBuyThroughRatePerProduct = (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentBuyThroughRatePerProductQueryFactoryV2({
        filters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchBuyThroughRatePerProduct = (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentBuyThroughRatePerProductQueryFactoryV2({
        filters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
