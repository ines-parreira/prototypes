import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { overallTimeSavedByAgentPerFeatureQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useTimeSavedPerFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallTimeSavedByAgentPerFeatureQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchTimeSavedPerFeature = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallTimeSavedByAgentPerFeatureQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
