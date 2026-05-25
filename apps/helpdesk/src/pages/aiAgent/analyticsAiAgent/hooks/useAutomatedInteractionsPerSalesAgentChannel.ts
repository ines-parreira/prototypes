import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerSalesAgentChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2(
        {
            filters: statsFilters,
            timezone,
            dimensions: ['channel'],
        },
    )
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerSalesAgentChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2(
        {
            filters: statsFilters,
            timezone,
            dimensions: ['channel'],
        },
    )
    return fetchStatsMetricPerDimension(query)
}
