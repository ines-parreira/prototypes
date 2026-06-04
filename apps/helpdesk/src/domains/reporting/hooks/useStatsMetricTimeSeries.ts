import {
    fetchStatsTimeSeries,
    fetchStatsTimeSeriesPerDimension,
    useStatsTimeSeries,
    useStatsTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsTimeSeries'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { DimensionName } from 'domains/reporting/models/scopes/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

/**
 * Shape of the query factory these hooks expect. This is exactly the
 * `timeseriesQueryFactory` returned by `getGenericQueries` (or the standalone
 * `getTimeseriesQuery`) in `domains/reporting/models/scopes/utils` — pass that
 * factory straight through. It builds a timeseries `BuiltQuery` for the metric,
 * optionally broken down by a single `dimension`.
 */
export type TimeSeriesFactory<
    TDimension extends DimensionName = DimensionName,
> = (ctx: {
    filters: StatsFilters
    timezone: string
    granularity: ReportingGranularity
    dimensions?: [TDimension]
}) => BuiltQuery<ScopeMeta>

export const useStatsMetricTimeSeries = <TDimension extends DimensionName>(
    query: TimeSeriesFactory<TDimension>,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => useStatsTimeSeries(query({ filters, timezone, granularity }))

export const useStatsMetricTimeSeriesPerDimension = <
    TDimension extends DimensionName,
>(
    query: TimeSeriesFactory<TDimension>,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    dimension: TDimension,
) =>
    useStatsTimeSeriesPerDimension(
        query({ filters, timezone, granularity, dimensions: [dimension] }),
    )

export const fetchStatsMetricTimeSeries = <TDimension extends DimensionName>(
    query: TimeSeriesFactory<TDimension>,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => fetchStatsTimeSeries(query({ filters, timezone, granularity }))

export const fetchStatsMetricTimeSeriesPerDimension = <
    TDimension extends DimensionName,
>(
    query: TimeSeriesFactory<TDimension>,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    dimension: TDimension,
) =>
    fetchStatsTimeSeriesPerDimension(
        query({ filters, timezone, granularity, dimensions: [dimension] }),
    )
