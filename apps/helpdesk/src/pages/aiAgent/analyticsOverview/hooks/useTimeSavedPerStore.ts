import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { dynamicMedianTimeSavedByAgentQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useTimeSavedPerStore = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicMedianTimeSavedByAgentQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return useStatsMetricPerDimension(query)
}

export const fetchTimeSavedPerStore = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicMedianTimeSavedByAgentQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return fetchStatsMetricPerDimension(query)
}
