import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting//models/scopes/scope'
import type {
    MergedRecordWithEnrichment,
    MetricPerDimensionWithEnrichment,
    MetricPerDimensionWithEnrichmentData,
    MetricWithDecile,
    MetricWithDecileData,
    MetricWithEnrichment,
    QueryReturnType,
    ReportingMetricItem,
    ReportingMetricItemValue,
} from 'domains/reporting/hooks/types'
import { withDeciles } from 'domains/reporting/hooks/withDeciles'
import { withEnrichment } from 'domains/reporting/hooks/withEnrichment'
import type { Cubes } from 'domains/reporting/models/cubes'
import type { UseEnrichedPostReportingQueryData } from 'domains/reporting/models/queries'
import {
    fetchPostReporting,
    fetchPostReportingV2,
    useEnrichedPostReporting,
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { postEnrichedReporting } from 'domains/reporting/models/resources'
import type {
    DimensionName,
    MeasureName,
} from 'domains/reporting/models/scopes/types'
import type {
    EnrichmentFields,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import type { DrillDownReportingQuery } from 'models/job/types'

export const selectMeasurePerDimension = <
    TValue extends ReportingMetricItemValue,
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    data: ReportingMetricItem<TValue, TCube>[] | null | undefined,
    query: ReportingQuery<TCube>,
    queryV2?: BuiltQuery<TMeta>,
    isV2?: boolean,
    dimensionId?: string | number, // TODO(Nicolas): dimension should not be optional
): MetricWithDecileData<TValue, TCube> => {
    const measures =
        isV2 && queryV2?.measures
            ? (queryV2.measures as readonly MeasureName[])
            : (query.measures as TCube['measures'][])
    const dimensions =
        isV2 && queryV2?.dimensions
            ? (queryV2.dimensions as readonly DimensionName[])
            : (query.dimensions as TCube['dimensions'][])

    if (
        !measures.length ||
        !dimensions.length ||
        data === null ||
        data === undefined
    ) {
        return {
            value: null,
            decile: null,
            allData: data ?? [],
            allValues: [],
            dimensions,
            measures,
        }
    }

    const dataMeasure =
        data.find(
            (row) => row[dimensions[0]]?.toString() === dimensionId?.toString(),
        ) ?? null

    const metric = dataMeasure?.[measures[0]] ?? null
    const decile = dataMeasure?.['decile'] ?? null

    const parseNumber = (value: TValue | null): number | null => {
        if (value === null) {
            return null
        }
        const parsed = typeof value === 'number' ? value : parseFloat(value)
        return isNaN(parsed) ? null : parsed
    }

    return {
        value: parseNumber(metric),
        decile: parseNumber(decile),
        allData: data,
        allValues: data.map((row) => ({
            dimension: row[dimensions[0]] ?? '',
            value: parseNumber(row[measures[0]] ?? null),
            decile: parseNumber(row['decile'] ?? null),
        })),
        dimensions,
        measures,
    }
}

const handleDataOnError = <
    TData,
    TObj extends { data: TData | null | undefined },
>(
    metricData: TObj,
): TObj & { data: TData | null } => {
    // `data` can be undefined on error
    if (metricData.data === undefined) {
        return { ...metricData, data: null }
    }

    return metricData as TObj & { data: TData | null } // TypeScript doesn't seem to understand data cannot be undefined here
}

const queryWithDeciles =
    <
        TValue extends ReportingMetricItemValue,
        TCube extends Cubes,
        TMeta extends ScopeMeta,
    >(
        query: ReportingQuery<TCube>,
        newQuery?: BuiltQuery<TMeta>,
    ) =>
    () =>
        metricExecutionHandler<QueryReturnType<TValue, TCube>, TCube, TMeta>({
            metricName: query.metricName,
            oldPayload: [query],
            newPayload: newQuery,
        }).then(withDeciles)

export function useMetricPerDimension<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
>(
    query: ReportingQuery<TCube>,
    dimensionId?: string,
    enabled?: boolean,
): MetricWithDecile<TValue, TCube> {
    const metricData = usePostReporting<
        QueryReturnType<TValue, TCube>,
        MetricWithDecileData<TValue, TCube>
    >([query], {
        select: (data) =>
            selectMeasurePerDimension<TValue, TCube, ScopeMeta>(
                data.data.data,
                query,
                undefined,
                undefined,
                dimensionId,
            ),
        queryFn: queryWithDeciles<TValue, TCube, ScopeMeta>(query, undefined),
        enabled,
    })

    return handleDataOnError(metricData)
}

export function useMetricPerDimensionV2<
    TCube extends Cubes = Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    query: ReportingQuery<TCube>,
    newQuery?: BuiltQuery<TMeta>,
    dimensionId?: string,
    enabled?: boolean,
): MetricWithDecile<string, TCube> {
    const migrationStage = useGetNewStatsFeatureFlagMigration(query.metricName)
    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

    const metricData = usePostReportingV2<
        QueryReturnType<string, TCube>,
        MetricWithDecileData<string, TCube>,
        TCube,
        TMeta
    >([query], newQuery, {
        select: (data) =>
            selectMeasurePerDimension<string, TCube, TMeta>(
                data.data.data,
                query,
                newQuery,
                isV2,
                dimensionId,
            ),
        queryFn: queryWithDeciles<string, TCube, TMeta>(query, newQuery),
        enabled,
    })

    return handleDataOnError(metricData)
}

export const fetchMetricPerDimension = async <
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
>(
    query: ReportingQuery<TCube>,
    dimensionId?: string,
): Promise<MetricWithDecile<TValue, TCube>> => {
    return fetchPostReporting<QueryReturnType<TValue, TCube>>([query], {
        queryFn: queryWithDeciles<TValue, TCube, ScopeMeta>(query),
    })
        .then((res) => ({
            data: selectMeasurePerDimension<TValue, TCube, ScopeMeta>(
                res.data.data,
                query,
                undefined,
                undefined,
                dimensionId,
            ),
            isFetching: false,
            isError: false,
        }))
        .catch(() => ({
            data: null,
            isFetching: false,
            isError: true,
        }))
}

export const fetchMetricPerDimensionV2 = async <
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    query: ReportingQuery<TCube>,
    newQuery?: BuiltQuery<TMeta>,
    dimensionId?: string,
): Promise<MetricWithDecile<TValue, TCube>> => {
    const migrationStage = await getNewStatsFeatureFlagMigration(
        query.metricName,
    )

    const isV2 = migrationStage === 'complete' || migrationStage === 'live'
    return fetchPostReportingV2<
        QueryReturnType<TValue, TCube>,
        MetricWithDecileData<TValue, TCube>,
        TCube,
        TMeta
    >([query], newQuery, {
        queryFn: queryWithDeciles<TValue, TCube, TMeta>(query, newQuery),
    })
        .then((res) => ({
            data: selectMeasurePerDimension<TValue, TCube, TMeta>(
                res.data.data,
                query,
                newQuery,
                isV2,
                dimensionId,
            ),
            isFetching: false,
            isError: false,
        }))
        .catch(() => ({
            data: null,
            isFetching: false,
            isError: true,
        }))
}

export function useMetricPerDimensionWithEnrichment(
    query: DrillDownReportingQuery,
    enrichmentFields: EnrichmentFields[],
    enrichmentIdField: EnrichmentFields,
    dimensionId?: string,
): MetricPerDimensionWithEnrichment<
    DrillDownReportingQuery['measures'][0],
    DrillDownReportingQuery['dimensions'][0]
> {
    const idField = query.dimensions[0]
    const metricData = useEnrichedPostReporting<
        {
            data: MergedRecordWithEnrichment[]
        },
        MetricPerDimensionWithEnrichmentData<
            DrillDownReportingQuery['measures'][0],
            DrillDownReportingQuery['dimensions'][0]
        >
    >(
        { query, enrichment_fields: enrichmentFields },
        {
            select: (data) => {
                const result = selectMeasurePerDimension(
                    data.data.data,
                    query,
                    undefined,
                    undefined,
                    dimensionId,
                )
                return result
                    ? {
                          value: result.value,
                          allData: data.data.data,
                      }
                    : null
            },
            queryFn: () => {
                return postEnrichedReporting<{
                    data: MergedRecordWithEnrichment[]
                    enrichment: MergedRecordWithEnrichment[]
                }>(query, enrichmentFields).then((data) =>
                    withEnrichment(
                        data,
                        idField,
                        enrichmentFields,
                        enrichmentIdField,
                    ),
                )
            },
        },
    )

    return handleDataOnError(metricData)
}

export function useMetricPerDimensionWithEnrichmentOnTwoDimensions(
    query: DrillDownReportingQuery,
    enrichmentFields: EnrichmentFields[],
    enrichmentMapping: Record<string, EnrichmentFields>,
): MetricWithEnrichment<
    (typeof query)['measures'][0],
    (typeof query)['dimensions'][0]
> {
    const metricData = useEnrichedPostReporting<
        {
            data: MergedRecordWithEnrichment[]
        },
        MergedRecordWithEnrichment[]
    >(
        { query, enrichment_fields: enrichmentFields },
        {
            select: (
                data: UseEnrichedPostReportingQueryData<{
                    data: MergedRecordWithEnrichment[]
                }>,
            ): UseEnrichedPostReportingQueryData<{
                data: MergedRecordWithEnrichment[]
            }>['data']['data'] => {
                return data.data.data
            },
            queryFn: () => {
                return postEnrichedReporting<{
                    data: MergedRecordWithEnrichment[]
                    enrichment: MergedRecordWithEnrichment[]
                }>(query, enrichmentFields).then((data) => {
                    const idFields = Object.keys(
                        enrichmentMapping,
                    ) as (typeof query)['dimensions'][0][]
                    const responseWithFirstDimension = withEnrichment(
                        data,
                        idFields[0],
                        enrichmentFields,
                        enrichmentMapping[idFields[0]],
                    )
                    if (idFields.length === 1) {
                        return responseWithFirstDimension
                    }
                    const responseWithSecondDimension = withEnrichment<
                        (typeof query)['measures'][0],
                        EnrichmentFields,
                        (typeof query)['dimensions'][0],
                        EnrichmentFields
                    >(
                        {
                            ...responseWithFirstDimension,
                            data: {
                                data: responseWithFirstDimension.data.data,
                                enrichment: data.data.enrichment,
                            },
                        },
                        idFields[1],
                        enrichmentFields,
                        enrichmentMapping[idFields[1]],
                    )
                    return responseWithSecondDimension
                })
            },
        },
    )

    return {
        isFetching: metricData.isFetching,
        isError: metricData.isError,
        data:
            metricData.data !== undefined
                ? {
                      allData: metricData?.data,
                  }
                : null,
    }
}

export const fetchMetricPerDimensionWithEnrichment = (
    query: DrillDownReportingQuery,
    enrichmentFields: EnrichmentFields[],
    enrichmentIdField: EnrichmentFields,
): Promise<
    MetricWithEnrichment<
        (typeof query)['measures'][0],
        (typeof query)['dimensions'][0]
    >
> => {
    const idField = query.dimensions[0]

    return postEnrichedReporting<{
        data: MergedRecordWithEnrichment[]
        enrichment: MergedRecordWithEnrichment[]
    }>(query, enrichmentFields)
        .then((res) => {
            const enrichedData = withEnrichment(
                res,
                idField,
                enrichmentFields,
                enrichmentIdField,
            )

            return {
                data: {
                    allData: enrichedData.data.data,
                },
                isFetching: false,
                isError: false,
            }
        })
        .catch(() => ({
            data: null,
            isFetching: false,
            isError: true,
        }))
}
