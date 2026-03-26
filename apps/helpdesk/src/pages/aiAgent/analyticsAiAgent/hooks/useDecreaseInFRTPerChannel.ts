import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSupportAgentDecreaseInFRTPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useDecreaseInFRTPerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSupportAgentDecreaseInFRTPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchDecreaseInFRTPerChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSupportAgentDecreaseInFRTPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
