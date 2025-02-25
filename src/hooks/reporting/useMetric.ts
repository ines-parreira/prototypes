import { Metric } from 'hooks/reporting/metrics'
import { QueryReturnType, selectMeasure } from 'hooks/reporting/useMetricTrend'
import { Cubes } from 'models/reporting/cubes'
import { fetchPostReporting, usePostReporting } from 'models/reporting/queries'
import { ReportingQuery } from 'models/reporting/types'

export type MetricFetch = (...arg: any) => Promise<Metric>

export function useMetric<TCube extends Cubes = Cubes>(
    query: ReportingQuery<TCube>,
): Metric {
    const currentPeriodMetric = usePostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([query], {
        select: (data) => selectMeasure(query.measures[0], data),
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
