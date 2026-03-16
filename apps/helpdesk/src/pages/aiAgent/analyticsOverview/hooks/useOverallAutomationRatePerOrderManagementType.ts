import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { overallAutomationRatePerOrderManagementTypeQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useOverallAutomationRatePerOrderManagementType = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallAutomationRatePerOrderManagementTypeQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return useStatsMetricPerDimension(query)
}

export const fetchOverallAutomationRatePerOrderManagementType = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallAutomationRatePerOrderManagementTypeQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return fetchStatsMetricPerDimension(query)
}
