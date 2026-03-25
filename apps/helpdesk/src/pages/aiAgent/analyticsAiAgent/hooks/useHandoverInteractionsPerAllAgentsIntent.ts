import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentHandoverInteractionsPerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerAllAgentsIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentHandoverInteractionsPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerAllAgentsIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentHandoverInteractionsPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
