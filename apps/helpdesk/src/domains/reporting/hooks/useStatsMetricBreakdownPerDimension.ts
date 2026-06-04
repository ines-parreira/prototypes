import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { DimensionName } from 'domains/reporting/models/scopes/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

/**
 * Shape of the query factory these hooks expect. This is exactly the
 * `breakdownQueryFactory` returned by `getGenericQueries` (or the standalone
 * `getBreakdownQuery`) in `domains/reporting/models/scopes/utils` — pass that
 * factory straight through. It builds a breakdown `BuiltQuery` for the metric,
 * grouped by a single `dimension`.
 */
export type DimensionBreakdownFactory<
    TDimension extends DimensionName = DimensionName,
> = (ctx: {
    filters: StatsFilters
    timezone: string
    dimensions: [TDimension]
}) => BuiltQuery<ScopeMeta>

export const useStatsMetricBreakdownPerDimension = <
    TDimension extends DimensionName,
>(
    query: DimensionBreakdownFactory<TDimension>,
    filters: StatsFilters,
    timezone: string,
    dimension: TDimension,
) =>
    useStatsMetricPerDimension(
        query({ filters, timezone, dimensions: [dimension] }),
        dimension,
    )

export const fetchStatsMetricBreakdownPerDimension = <
    TDimension extends DimensionName,
>(
    query: DimensionBreakdownFactory<TDimension>,
    filters: StatsFilters,
    timezone: string,
    dimension: TDimension,
) =>
    fetchStatsMetricPerDimension(
        query({ filters, timezone, dimensions: [dimension] }),
        dimension,
    )
