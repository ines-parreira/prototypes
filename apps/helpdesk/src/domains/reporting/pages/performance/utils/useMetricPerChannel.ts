import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

const CHANNEL_DIMENSION = 'channel'

export type ChannelBreakdownFactory = (ctx: {
    filters: StatsFilters
    timezone: string
    dimensions: [typeof CHANNEL_DIMENSION]
}) => BuiltQuery<ScopeMeta>

export const useMetricPerChannel = (
    query: ChannelBreakdownFactory,
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricPerDimension(
        query({ filters, timezone, dimensions: [CHANNEL_DIMENSION] }),
        CHANNEL_DIMENSION,
    )

export const fetchMetricPerChannel = async (
    query: ChannelBreakdownFactory,
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricPerDimension(
        query({ filters, timezone, dimensions: [CHANNEL_DIMENSION] }),
        CHANNEL_DIMENSION,
    )
