import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerShoppingAssistantEngagementFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2(
        {
            filters: statsFilters,
            timezone,
            dimensions: ['engagementType'],
        },
    )
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerShoppingAssistantEngagementFeature =
    async (statsFilters: StatsFilters, timezone: string) => {
        const query =
            shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2({
                filters: statsFilters,
                timezone,
                dimensions: ['engagementType'],
            })
        return fetchStatsMetricPerDimension(query)
    }
