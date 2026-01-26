import type { MetricTrend } from '@repo/reporting'

import {
    fetchStatsMetric,
    useStatsMetric,
} from 'domains/reporting/hooks/useStatsMetric'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'

type GenericMetricTrend = Omit<MetricTrend, 'data'> & {
    data?: {
        value: number | null
        prevValue: number | null
    }
}

export async function fetchStatsMetricTrend<
    TMeta extends ScopeMeta = ScopeMeta,
>(
    currentPeriodQuery: BuiltQuery<TMeta>,
    prevPeriodQuery: BuiltQuery<TMeta>,
): Promise<GenericMetricTrend> {
    const currentPeriodMetric = fetchStatsMetric<TMeta>(currentPeriodQuery)
    const prevPeriodMetric = fetchStatsMetric<TMeta>(prevPeriodQuery)

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

export default function useStatsMetricTrend<TMeta extends ScopeMeta>(
    currentPeriodQuery: BuiltQuery<TMeta>,
    prevPeriodQuery: BuiltQuery<TMeta>,
): GenericMetricTrend {
    const currentPeriodMetric = useStatsMetric<TMeta>(currentPeriodQuery)
    const prevPeriodMetric = useStatsMetric<TMeta>(prevPeriodQuery)

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
