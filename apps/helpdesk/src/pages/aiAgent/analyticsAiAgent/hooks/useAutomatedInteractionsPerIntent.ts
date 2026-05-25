import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { allAgentsAutomatedInteractionsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = allAgentsAutomatedInteractionsBreakdownQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['aiIntentCustomField'],
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = allAgentsAutomatedInteractionsBreakdownQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['aiIntentCustomField'],
    })
    return fetchStatsMetricPerDimension(query)
}
