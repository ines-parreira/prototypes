import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { dynamicAiAgentDecreaseInResolutionTimeQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentDecreaseInResolutionTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useDecreaseInResolutionTimePerStore = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicAiAgentDecreaseInResolutionTimeQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return useStatsMetricPerDimension(query)
}

export const fetchDecreaseInResolutionTimePerStore = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicAiAgentDecreaseInResolutionTimeQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return fetchStatsMetricPerDimension(query)
}
