import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import type { Cubes } from 'domains/reporting/models/cubes'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { ReportingQuery } from 'domains/reporting/models/types'

/**
 * Per-dimension analogue of `useMetricTrend`: fires the current-period and
 * previous-period queries in parallel and combines the loading/error flags
 * so callers don't have to repeat that plumbing. Mirrors the analytics
 * `getTrendHook` pattern at the per-dimension layer used by knowledge
 * metrics.
 *
 * Lives in its own file so test consumers can `jest.mock` the underlying
 * `useMetricPerDimensionV2` and have the mock take effect here.
 */
export type MetricPerDimensionTrend<TCube extends Cubes> = {
    isFetching: boolean
    isError: boolean
    currentPeriod: MetricWithDecile<string, TCube>
    prevPeriod: MetricWithDecile<string, TCube>
}

export function useMetricPerDimensionTrendV2<
    TCube extends Cubes = Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    currentQuery: ReportingQuery<TCube>,
    prevQuery: ReportingQuery<TCube>,
    currentQueryV2?: BuiltQuery<TMeta>,
    prevQueryV2?: BuiltQuery<TMeta>,
    dimensionId?: string,
    enabled?: boolean,
): MetricPerDimensionTrend<TCube> {
    const currentPeriod = useMetricPerDimensionV2<TCube, TMeta>(
        currentQuery,
        currentQueryV2,
        dimensionId,
        enabled,
    )
    const prevPeriod = useMetricPerDimensionV2<TCube, TMeta>(
        prevQuery,
        prevQueryV2,
        dimensionId,
        enabled,
    )

    return {
        isFetching: currentPeriod.isFetching || prevPeriod.isFetching,
        isError: currentPeriod.isError || prevPeriod.isError,
        currentPeriod,
        prevPeriod,
    }
}
