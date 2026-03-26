import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { overallTimeSavedByAgentPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useTimeSavedByAgentPerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallTimeSavedByAgentPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchTimeSavedByAgentPerChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallTimeSavedByAgentPerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
