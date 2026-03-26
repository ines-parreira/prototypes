import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSalesTotalSalesPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useTotalSalesPerSalesAgentChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesTotalSalesPerChannelQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchTotalSalesPerSalesAgentChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesTotalSalesPerChannelQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
