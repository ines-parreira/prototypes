import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { dynamicAiAgentDecreaseInFRTQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useDecreaseInFirstResponseTimePerStore = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicAiAgentDecreaseInFRTQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return useStatsMetricPerDimension(query)
}

export const fetchDecreaseInFirstResponseTimePerStore = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicAiAgentDecreaseInFRTQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return fetchStatsMetricPerDimension(query)
}
