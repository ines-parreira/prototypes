import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { supportAgentAutomatedInteractionsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerSupportAgentChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = supportAgentAutomatedInteractionsBreakdownQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['channel'],
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerSupportAgentChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = supportAgentAutomatedInteractionsBreakdownQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['channel'],
    })
    return fetchStatsMetricPerDimension(query)
}
