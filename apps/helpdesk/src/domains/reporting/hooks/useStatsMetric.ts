import type { Metric } from 'domains/reporting/hooks/metrics'
import type {
    QueryReturnType,
    ReportingMetricItem,
} from 'domains/reporting/hooks/types'
import type { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import { fetchPostStats, usePostStats } from 'domains/reporting/models/queries'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'

/**
 * Union of the measure names declared by a scope's meta, e.g.
 * `'inboundCallsCount' | 'outboundCallsCount' | ...`. Used to type the optional
 * `measureName` argument so a caller can pick a specific column from a
 * multi-measure value query.
 */
export type MeasureNameOf<TMeta extends ScopeMeta> = TMeta['measures'][number]

export const selectStatsMeasure = <TMeta extends ScopeMeta = ScopeMeta>(
    data: UsePostReportingQueryData<QueryReturnType<string>>,
    statsQuery: BuiltQuery<TMeta>,
    measureName?: MeasureNameOf<TMeta>,
) => {
    const measure = measureName ?? statsQuery.measures[0]
    if (!measure) return null
    const dataMeasure = data.data.data?.[0]?.[measure] ?? null
    return dataMeasure !== null ? parseFloat(dataMeasure) : null
}

export function useStatsMetric<TMeta extends ScopeMeta = ScopeMeta>(
    statsQuery: BuiltQuery<TMeta>,
    enabled: boolean = true,
    measureName?: MeasureNameOf<TMeta>,
): Metric {
    const currentPeriodMetric = usePostStats<
        ReportingMetricItem<string>[],
        number | null,
        TMeta
    >(statsQuery, {
        select: (data) =>
            selectStatsMeasure<TMeta>(data, statsQuery, measureName),
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

export const fetchStatsMetric = async <TMeta extends ScopeMeta = ScopeMeta>(
    statsQuery: BuiltQuery<TMeta>,
    measureName?: MeasureNameOf<TMeta>,
): Promise<Metric> => {
    return fetchPostStats<ReportingMetricItem<string>[], number | null, TMeta>(
        statsQuery,
    )
        .then((res) => ({
            isFetching: false,
            isError: false,
            data:
                res.data.data !== undefined
                    ? {
                          value: selectStatsMeasure<TMeta>(
                              res,
                              statsQuery,
                              measureName,
                          ),
                      }
                    : undefined,
        }))
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}
