import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSalesTotalSalesPerEngagementTypeQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useTotalSalesPerShoppingAssistantEngagementFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesTotalSalesPerEngagementTypeQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchTotalSalesPerShoppingAssistantEngagementFeature = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesTotalSalesPerEngagementTypeQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
