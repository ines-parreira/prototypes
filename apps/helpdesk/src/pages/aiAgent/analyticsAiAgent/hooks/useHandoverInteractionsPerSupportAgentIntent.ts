import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSupportHandoverInteractionsPerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerSupportAgentIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSupportHandoverInteractionsPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerSupportAgentIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSupportHandoverInteractionsPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
