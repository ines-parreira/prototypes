import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentAutomatedInteractionsPerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentAutomatedInteractionsPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentAutomatedInteractionsPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
