import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSalesAgentBuyThroughRatePerProductQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentBuyThroughRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useBuyThroughRatePerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentBuyThroughRatePerProductQueryFactoryV2({
        filters: { period: statsFilters.period },
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchBuyThroughRatePerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentBuyThroughRatePerProductQueryFactoryV2({
        filters: { period: statsFilters.period },
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
