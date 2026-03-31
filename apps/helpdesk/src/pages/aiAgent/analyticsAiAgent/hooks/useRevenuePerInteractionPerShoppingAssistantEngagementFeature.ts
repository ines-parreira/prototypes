import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSalesRevenuePerInteractionPerEngagementTypeQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useRevenuePerInteractionPerShoppingAssistantEngagementFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query =
        aiAgentSalesRevenuePerInteractionPerEngagementTypeQueryV2Factory({
            filters: statsFilters,
            timezone,
        })
    return useStatsMetricPerDimension(query)
}

export const fetchRevenuePerInteractionPerShoppingAssistantEngagementFeature =
    async (statsFilters: StatsFilters, timezone: string) => {
        const query =
            aiAgentSalesRevenuePerInteractionPerEngagementTypeQueryV2Factory({
                filters: statsFilters,
                timezone,
            })
        return fetchStatsMetricPerDimension(query)
    }
