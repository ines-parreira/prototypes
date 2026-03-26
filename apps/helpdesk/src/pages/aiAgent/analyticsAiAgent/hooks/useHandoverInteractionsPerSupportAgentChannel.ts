import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSupportHandoverInteractionsPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerSupportAgentChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSupportHandoverInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerSupportAgentChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSupportHandoverInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
