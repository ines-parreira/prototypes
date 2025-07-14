import { Metric } from 'domains/reporting/hooks/metrics'
import {
    QueryReturnType,
    selectMeasure,
} from 'domains/reporting/hooks/useMetricTrend'
import { Cubes } from 'domains/reporting/models/cubes'
import {
    fetchPostReporting,
    usePostReporting,
} from 'domains/reporting/models/queries'
import { ReportingQuery } from 'domains/reporting/models/types'

export type MetricFetch = (...arg: any) => Promise<Metric>

export function useMetric<TCube extends Cubes = Cubes>(
    query: ReportingQuery<TCube>,
    enabled: boolean = true,
): Metric {
    const currentPeriodMetric = usePostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([query], {
        select: (data) => selectMeasure(query.measures[0], data),
        enabled,
    })

    return {
        isFetching: currentPeriodMetric.isFetching,
        isError: currentPeriodMetric.isError,
        data:
            currentPeriodMetric.data !== undefined
                ? {
                      value: currentPeriodMetric.data,
                  }
                : undefined,
    }
}

export const fetchMetric = async <TCube extends Cubes = Cubes>(
    query: ReportingQuery<TCube>,
): Promise<Metric> => {
    return fetchPostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([query])
        .then((res) => ({
            isFetching: false,
            isError: false,
            data:
                res.data.data !== undefined
                    ? {
                          value: selectMeasure(query.measures[0], res),
                      }
                    : undefined,
        }))
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}
