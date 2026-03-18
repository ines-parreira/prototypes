import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { automatedInteractionsPerFlowsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomatedInteractionsPerFlows = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = automatedInteractionsPerFlowsQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerFlows = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = automatedInteractionsPerFlowsQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
