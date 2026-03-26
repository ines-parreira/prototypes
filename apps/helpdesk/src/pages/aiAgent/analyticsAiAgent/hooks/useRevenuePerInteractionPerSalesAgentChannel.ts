import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSalesRevenuePerInteractionPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useRevenuePerInteractionPerSalesAgentChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesRevenuePerInteractionPerChannelQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchRevenuePerInteractionPerSalesAgentChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesRevenuePerInteractionPerChannelQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
