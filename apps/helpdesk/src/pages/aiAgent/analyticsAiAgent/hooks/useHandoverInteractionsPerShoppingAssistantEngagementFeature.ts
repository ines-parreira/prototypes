import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSalesAgentHandoverInteractionsPerEngagementTypeQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerShoppingAssistantEngagementFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query =
        aiSalesAgentHandoverInteractionsPerEngagementTypeQueryFactoryV2({
            filters: statsFilters,
            timezone,
        })
    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerShoppingAssistantEngagementFeature =
    async (statsFilters: StatsFilters, timezone: string) => {
        const query =
            aiSalesAgentHandoverInteractionsPerEngagementTypeQueryFactoryV2({
                filters: statsFilters,
                timezone,
            })
        return fetchStatsMetricPerDimension(query)
    }
