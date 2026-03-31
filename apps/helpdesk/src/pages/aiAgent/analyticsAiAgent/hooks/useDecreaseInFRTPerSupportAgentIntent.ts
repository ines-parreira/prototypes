import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSupportAgentDecreaseInFRTPerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useDecreaseInFRTPerSupportAgentIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSupportAgentDecreaseInFRTPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchDecreaseInFRTPerSupportAgentIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSupportAgentDecreaseInFRTPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
