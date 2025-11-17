import type { Metric } from 'domains/reporting/hooks/metrics'
import type { Cubes } from 'domains/reporting/models/cubes'
import type { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export type MetricFetch = (...arg: any) => Promise<Metric>

export type QueryReturnType<Measure extends Cubes['measures']> = [
    Record<Measure, string | null>,
]

export const selectMeasure = <
    TCube extends Cubes = Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    data: UsePostReportingQueryData<QueryReturnType<Cubes['measures']>>,
    query: ReportingQuery<TCube>,
    queryV2?: BuiltQuery<TMeta>,
    isV2?: boolean,
) => {
    const measure =
        isV2 && queryV2?.measures
            ? (queryV2.measures[0] as TCube['measures'])
            : query.measures[0]
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
    const migrationStage = useGetNewStatsFeatureFlagMigration(query.metricName)
    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

    const currentPeriodMetric = usePostReportingV2<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube,
        TMeta
    >([query], queryV2, {
        select: (data) =>
            selectMeasure<TCube, TMeta>(data, query, queryV2, isV2),
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
    const migrationStage = await getNewStatsFeatureFlagMigration(
        query.metricName,
    )

    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

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
                          value: selectMeasure<TCube, TMeta>(
                              res,
                              query,
                              queryV2,
                              isV2,
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
