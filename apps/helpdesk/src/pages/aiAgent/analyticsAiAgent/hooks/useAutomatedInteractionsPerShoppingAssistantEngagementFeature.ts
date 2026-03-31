import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSalesAgentAutomatedInteractionsPerEngagementTypeQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerShoppingAssistantEngagementFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query =
        aiSalesAgentAutomatedInteractionsPerEngagementTypeQueryFactoryV2({
            filters: statsFilters,
            timezone,
        })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerShoppingAssistantEngagementFeature =
    async (statsFilters: StatsFilters, timezone: string) => {
        const query =
            aiSalesAgentAutomatedInteractionsPerEngagementTypeQueryFactoryV2({
                filters: statsFilters,
                timezone,
            })
        return fetchStatsMetricPerDimension(query)
    }
