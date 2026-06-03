import type { DimensionBreakdownFactory } from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import {
    fetchStatsMetricBreakdownPerDimension,
    useStatsMetricBreakdownPerDimension,
} from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export type ChannelBreakdownFactory = DimensionBreakdownFactory<'channel'>

export const useMetricPerChannel = (
    query: ChannelBreakdownFactory,
    filters: StatsFilters,
    timezone: string,
) => useStatsMetricBreakdownPerDimension(query, filters, timezone, 'channel')

export const fetchMetricPerChannel = (
    query: ChannelBreakdownFactory,
    filters: StatsFilters,
    timezone: string,
) => fetchStatsMetricBreakdownPerDimension(query, filters, timezone, 'channel')
