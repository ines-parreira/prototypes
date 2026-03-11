import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { handoverInteractionsPerFeatureQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = handoverInteractionsPerFeatureQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerFeature = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = handoverInteractionsPerFeatureQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })

    return fetchStatsMetricPerDimension(query)
}
