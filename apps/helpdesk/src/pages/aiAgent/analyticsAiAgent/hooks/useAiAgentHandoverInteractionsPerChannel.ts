import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { handoverInteractionsPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAiAgentHandoverInteractionsPerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = handoverInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAiAgentHandoverInteractionsPerChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = handoverInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
