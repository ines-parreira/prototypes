import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentAutomatedInteractionsPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAiAgentAutomatedInteractionsPerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentAutomatedInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAiAgentAutomatedInteractionsPerChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentAutomatedInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
