import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { overallTimeSavedByAgentPerFlowsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useTimeSavedPerFlows = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallTimeSavedByAgentPerFlowsQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchTimeSavedPerFlows = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallTimeSavedByAgentPerFlowsQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
