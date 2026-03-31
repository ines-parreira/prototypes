import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSalesOrdersInfluencedPerEngagementTypeQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useOrdersInfluencedPerShoppingAssistantEngagementFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesOrdersInfluencedPerEngagementTypeQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchOrdersInfluencedPerShoppingAssistantEngagementFeature =
    async (statsFilters: StatsFilters, timezone: string) => {
        const query =
            aiAgentSalesOrdersInfluencedPerEngagementTypeQueryV2Factory({
                filters: statsFilters,
                timezone,
            })
        return fetchStatsMetricPerDimension(query)
    }
