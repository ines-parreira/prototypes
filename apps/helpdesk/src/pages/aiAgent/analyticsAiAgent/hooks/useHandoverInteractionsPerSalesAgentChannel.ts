import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSalesAgentHandoverInteractionsPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerSalesAgentChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentHandoverInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerSalesAgentChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSalesAgentHandoverInteractionsPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
