import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2 } from 'domains/reporting/models/scopes/flowDataset'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerFlows = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerFlows = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
