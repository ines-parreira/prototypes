import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { automatedInteractionsPerOrderManagementTypeQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerOrderManagementType = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = automatedInteractionsPerOrderManagementTypeQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerOrderManagementType = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = automatedInteractionsPerOrderManagementTypeQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return fetchStatsMetricPerDimension(query)
}
