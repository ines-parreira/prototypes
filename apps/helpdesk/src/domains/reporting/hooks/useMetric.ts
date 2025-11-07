import { Metric } from 'domains/reporting/hooks/metrics'
import { Cubes } from 'domains/reporting/models/cubes'
import {
    fetchPostReportingV2,
    UsePostReportingQueryData,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { ReportingQuery } from 'domains/reporting/models/types'

import { BuiltQuery, ScopeMeta } from '../models/scopes/scope'

export type MetricFetch = (...arg: any) => Promise<Metric>

export type QueryReturnType<Measure extends Cubes['measures']> = [
    Record<Measure, string | null>,
]

export const selectMeasure = <Measure extends Cubes['measures']>(
    measure: Measure,
    data: UsePostReportingQueryData<QueryReturnType<Measure>>,
) => {
    const dataMeasure = data.data.data?.[0]?.[measure] || null
    return dataMeasure !== null ? parseFloat(dataMeasure) : null
}

export function useMetric<
    TCube extends Cubes = Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    query: ReportingQuery<TCube>,
    queryV2?: BuiltQuery<TMeta>,
    enabled: boolean = true,
): Metric {
    const currentPeriodMetric = usePostReportingV2<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube,
        TMeta
    >([query], queryV2, {
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

export const fetchMetric = async <
    TCube extends Cubes = Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    query: ReportingQuery<TCube>,
    queryV2?: BuiltQuery<TMeta>,
): Promise<Metric> => {
    return fetchPostReportingV2<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube,
        TMeta
    >([query], queryV2)
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
