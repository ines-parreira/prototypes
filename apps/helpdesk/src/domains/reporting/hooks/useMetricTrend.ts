import { fetchMetric, useMetric } from 'domains/reporting/hooks/useMetric'
import type { Cubes } from 'domains/reporting/models/cubes'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'

/**
 * @deprecated Use MetricTrend from @repo/reporting instead
 * @date 2025-11-05
 * @type reporting-ui-kit
 */
export type MetricTrend = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
        prevValue: number | null
    }
}

export type MetricTrendWithCurrency = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
        prevValue: number | null
        currency: string
    }
}

export const isMetricTrendWithCurrency = (
    trend: MetricTrend | MetricTrendWithCurrency,
): trend is MetricTrendWithCurrency => {
    return !!(trend.data && 'currency' in trend.data)
}

export type MetricTrendHook = (
    statsFilters: StatsFilters,
    timezone: string,
    enabled?: boolean,
) => MetricTrend | MetricTrendWithCurrency

export type MetricTrendFetch = (
    statsFilters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => Promise<MetricTrend>

export async function fetchMetricTrend<
    TCube extends Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    currentPeriodQuery?: ReportingQuery<TCube>,
    prevPeriodQuery?: ReportingQuery<TCube>,
    currentPeriodQueryV2?: BuiltQuery<TMeta>,
    prevPeriodQueryV2?: BuiltQuery<TMeta>,
): Promise<MetricTrend> {
    const currentPeriodMetric = fetchMetric<TCube, TMeta>(
        currentPeriodQuery,
        currentPeriodQueryV2,
    )
    const prevPeriodMetric = fetchMetric<TCube, TMeta>(
        prevPeriodQuery,
        prevPeriodQueryV2,
    )

    return Promise.all([currentPeriodMetric, prevPeriodMetric])
        .then(([currentPeriodResult, previousPeriodResult]) => ({
            isFetching: false,
            isError:
                currentPeriodResult.isError || previousPeriodResult.isError,
            data:
                currentPeriodResult.data !== undefined &&
                previousPeriodResult.data !== undefined
                    ? {
                          value: currentPeriodResult.data.value,
                          prevValue: previousPeriodResult.data.value,
                      }
                    : undefined,
        }))
        .catch(() => {
            return {
                isFetching: false,
                isError: true,
                data: undefined,
            }
        })
}

export default function useMetricTrend<
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    currentPeriodQuery?: ReportingQuery<TCube>,
    prevPeriodQuery?: ReportingQuery<TCube>,
    currentPeriodQueryV2?: BuiltQuery<TMeta>,
    prevPeriodQueryV2?: BuiltQuery<TMeta>,
    enabled: boolean = true,
): MetricTrend {
    const currentPeriodMetric = useMetric<TCube, TMeta>(
        currentPeriodQuery,
        currentPeriodQueryV2,
        enabled,
    )
    const prevPeriodMetric = useMetric<TCube, TMeta>(
        prevPeriodQuery,
        prevPeriodQueryV2,
        enabled,
    )

    return {
        isFetching:
            currentPeriodMetric.isFetching || prevPeriodMetric.isFetching,
        isError: currentPeriodMetric.isError || prevPeriodMetric.isError,
        data:
            currentPeriodMetric.data !== undefined &&
            prevPeriodMetric.data !== undefined
                ? {
                      value: currentPeriodMetric.data.value,
                      prevValue: prevPeriodMetric.data.value,
                  }
                : undefined,
    }
}
