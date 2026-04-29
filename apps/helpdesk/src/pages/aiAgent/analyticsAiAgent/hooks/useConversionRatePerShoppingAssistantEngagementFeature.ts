import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSalesConversionRatePerEngagementTypeQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useConversionRatePerShoppingAssistantEngagementFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesConversionRatePerEngagementTypeQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchConversionRatePerShoppingAssistantEngagementFeature = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesConversionRatePerEngagementTypeQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
