import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { dynamicOverallAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useOverallAutomationRatePerStore = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicOverallAutomationRateQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return useStatsMetricPerDimension(query)
}

export const fetchOverallAutomationRatePerStore = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicOverallAutomationRateQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return fetchStatsMetricPerDimension(query)
}
