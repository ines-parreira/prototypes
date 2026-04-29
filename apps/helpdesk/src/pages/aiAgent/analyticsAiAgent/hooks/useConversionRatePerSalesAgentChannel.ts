import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSalesConversionRatePerChannelQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useConversionRatePerSalesAgentChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesConversionRatePerChannelQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchConversionRatePerSalesAgentChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesConversionRatePerChannelQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
