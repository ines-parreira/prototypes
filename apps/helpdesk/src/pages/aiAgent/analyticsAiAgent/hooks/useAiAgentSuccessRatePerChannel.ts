import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSuccessRatePerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAiAgentSuccessRatePerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSuccessRatePerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAiAgentSuccessRatePerChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSuccessRatePerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
