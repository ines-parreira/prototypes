import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerStore = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicOverallAutomatedInteractionsQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerStore = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = dynamicOverallAutomatedInteractionsQueryFactoryV2({
        filters: statsFilters,
        timezone,
        dimensions: ['storeIntegrationId'],
    })
    return fetchStatsMetricPerDimension(query)
}
