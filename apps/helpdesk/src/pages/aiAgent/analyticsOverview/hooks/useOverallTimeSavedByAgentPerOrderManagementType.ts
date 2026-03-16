import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { overallTimeSavedByAgentForOrderManagementQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useOverallTimeSavedByAgentPerOrderManagementType = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallTimeSavedByAgentForOrderManagementQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return useStatsMetricPerDimension(query)
}

export const fetchOverallTimeSavedByAgentPerOrderManagementType = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallTimeSavedByAgentForOrderManagementQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return fetchStatsMetricPerDimension(query)
}
