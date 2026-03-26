import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSupportAgentAutomatedInteractionsPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerSupportAgentChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSupportAgentAutomatedInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerSupportAgentChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSupportAgentAutomatedInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
