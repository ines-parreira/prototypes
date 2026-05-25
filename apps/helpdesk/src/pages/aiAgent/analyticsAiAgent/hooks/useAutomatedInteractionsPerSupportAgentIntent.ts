import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { supportAgentAutomatedInteractionsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerSupportAgentIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = supportAgentAutomatedInteractionsBreakdownQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['aiIntentCustomField'],
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerSupportAgentIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = supportAgentAutomatedInteractionsBreakdownQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['aiIntentCustomField'],
    })
    return fetchStatsMetricPerDimension(query)
}
