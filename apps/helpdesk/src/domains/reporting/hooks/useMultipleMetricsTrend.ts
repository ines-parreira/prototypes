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

export type MultipleMetricsData<TCube extends Cubes> = Record<
    TCube['measures'],
    {
        value: number | null
        prevValue: number | null
        rawData?: Record<string, any>
    }
>

export type MultipleMetricsTrend<TCube extends Cubes> = {
    isFetching: boolean
    isError: boolean
    data: MultipleMetricsData<TCube>
}

const multipleMetricsSelect = <TCube extends Cubes>(
    data: UsePostReportingQueryData<Record<TCube['measures'], string>[]>,
) => data.data.data[0]

export const useMultipleMetricsTrends = <
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    currentPeriodQuery: ReportingQuery<TCube>,
    previousPeriodQuery: ReportingQuery<TCube>,
    currentPeriodQueryV2?: BuiltQuery<TMeta>,
    previousPeriodQueryV2?: BuiltQuery<TMeta>,
    enabled?: boolean,
): MultipleMetricsTrend<TCube> => {
    const migrationStage = useGetNewStatsFeatureFlagMigration(
        currentPeriodQuery.metricName,
    )
    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

    const currentMetrics = usePostReportingV2<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube,
        TMeta
    >([currentPeriodQuery], currentPeriodQueryV2, {
        select: multipleMetricsSelect,
        enabled,
    })

    const previousMetrics = usePostReportingV2<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube,
        TMeta
    >([previousPeriodQuery], previousPeriodQueryV2, {
        select: multipleMetricsSelect,
        enabled,
    })

    const measures =
        isV2 && currentPeriodQueryV2
            ? (currentPeriodQueryV2.measures as unknown as TCube['measures'][])
            : currentPeriodQuery.measures
    const data = measures.reduce((acc, measure) => {
        acc[measure] = {
            value: currentMetrics.data?.[measure]
                ? parseFloat(currentMetrics.data[measure])
                : null,
            prevValue: previousMetrics.data?.[measure]
                ? parseFloat(previousMetrics.data[measure])
                : null,
            rawData: currentMetrics.data,
        }
        return acc
    }, {} as MultipleMetricsData<TCube>)

    return {
        isFetching: currentMetrics.isFetching || previousMetrics.isFetching,
        isError: currentMetrics.isError || previousMetrics.isError,
        data,
    }
}

export const fetchMultipleMetricsTrends = async <
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    currentPeriodQuery: ReportingQuery<TCube>,
    previousPeriodQuery: ReportingQuery<TCube>,
    currentPeriodQueryV2?: BuiltQuery<TMeta>,
    previousPeriodQueryV2?: BuiltQuery<TMeta>,
): Promise<MultipleMetricsTrend<TCube>> => {
    const currentMetrics = fetchPostReportingV2<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube,
        TMeta
    >([currentPeriodQuery], currentPeriodQueryV2)

    const previousMetrics = fetchPostReportingV2<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube,
        TMeta
    >([previousPeriodQuery], previousPeriodQueryV2)

    const migrationStage = getNewStatsFeatureFlagMigration(
        currentPeriodQuery.metricName,
    )

    return Promise.all([currentMetrics, previousMetrics, migrationStage])
        .then(([currentMetricsResult, previousMetricsResult, stage]) => {
            const currentMetrics = multipleMetricsSelect(currentMetricsResult)
            const previousMetrics = multipleMetricsSelect(previousMetricsResult)
            const isV2 =
                (stage === 'complete' || stage === 'live') &&
                !!currentPeriodQueryV2
            const measures = isV2
                ? (currentPeriodQueryV2!
                      .measures as unknown as TCube['measures'][])
                : currentPeriodQuery.measures
            const data = measures.reduce((acc, measure) => {
                acc[measure] = {
                    value: currentMetrics?.[measure]
                        ? parseFloat(currentMetrics[measure])
                        : null,
                    prevValue: previousMetrics?.[measure]
                        ? parseFloat(previousMetrics[measure])
                        : null,
                    rawData: currentMetrics,
                }
                return acc
            }, {} as MultipleMetricsData<TCube>)

            return {
                isFetching: false,
                isError: false,
                data,
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: currentPeriodQuery.measures.reduce((acc, measure) => {
                acc[measure] = {
                    value: null,
                    prevValue: null,
                    rawData: undefined,
                }
                return acc
            }, {} as MultipleMetricsData<TCube>),
        }))
}
