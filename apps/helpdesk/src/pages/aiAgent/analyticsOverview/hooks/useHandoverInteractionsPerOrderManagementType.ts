import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { handoverInteractionsPerOrderManagementTypeQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const HANDOVER_DIMENSION = 'cancel_order'

export const useHandoverInteractionsPerOrderManagementType = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = handoverInteractionsPerOrderManagementTypeQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerOrderManagementType = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = handoverInteractionsPerOrderManagementTypeQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return fetchStatsMetricPerDimension(query)
}
