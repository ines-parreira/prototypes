import { MigrationStage } from 'core/flags/utils/readMigration'
import { BuiltQuery, ScopeMeta } from 'domains/reporting//models/scopes/scope'
import { RequestedData } from 'domains/reporting/hooks/types'
import {
    TicketCustomFieldsTicketCountData,
    withBreakdown,
} from 'domains/reporting/hooks/withBreakdown'
import { withDeciles } from 'domains/reporting/hooks/withDeciles'
import {
    IDRecord,
    MergedRecord,
    withEnrichment,
} from 'domains/reporting/hooks/withEnrichment'
import { Cubes } from 'domains/reporting/models/cubes'
import {
    fetchPostReporting,
    fetchPostReportingV2,
    useEnrichedPostReporting,
    UseEnrichedPostReportingQueryData,
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { CustomFieldsReportingQuery } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    postEnrichedReporting,
    postReportingV1,
} from 'domains/reporting/models/resources'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    EnrichmentFields,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { OrderDirection } from 'models/api/types'
import { DrillDownReportingQuery } from 'models/job/types'
import { WithChildren } from 'pages/common/components/table/TableBodyRowExpandable'

export type ReportingMetricItem<TCube extends Cubes = Cubes> = Record<
    TCube['measures'][0] | TCube['dimensions'][0] | 'decile',
    string | null
>

export type MetricWithDecileData<TCube extends Cubes = Cubes> = {
    value: number | null
    decile: number | null
    allData: ReportingMetricItem<TCube>[]
} | null

export type MetricWithDecile<TCube extends Cubes = Cubes> = RequestedData & {
    data: MetricWithDecileData<TCube>
}

export type MetricWithDecileFetch = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) => Promise<MetricWithDecile>

export type MetricPerDimensionTrend<TCube extends Cubes = Cubes> =
    RequestedData & {
        data: {
            value: QueryReturnType<TCube>
            prevValue: QueryReturnType<TCube>
        }
    }

export type MetricWithBreakdown = RequestedData & {
    data: {
        allData: WithChildren<TicketCustomFieldsTicketCountData>[]
    } | null
}

export type MetricWithEnrichment<
    T extends string,
    ID extends string,
> = RequestedData & {
    data: {
        allData: (MergedRecord<
            T,
            EnrichmentFields | EnrichmentFields.TicketId
        > &
            IDRecord<ID>)[]
    } | null
}

export type MergedRecordWithEnrichment = MergedRecord<
    DrillDownReportingQuery['measures'][0],
    EnrichmentFields
> &
    IDRecord<DrillDownReportingQuery['dimensions'][0]>

export type MetricPerDimensionWithEnrichmentData<
    T extends string,
    ID extends string,
> = {
    value: number | null
    allData: (MergedRecord<T, EnrichmentFields | EnrichmentFields.TicketId> &
        IDRecord<ID>)[]
} | null

export type MetricPerDimensionWithEnrichment<
    T extends string,
    ID extends string,
> = RequestedData & {
    data: MetricPerDimensionWithEnrichmentData<T, ID>
}

export type QueryReturnType<TCube extends Cubes> = ReportingMetricItem<TCube>[]

export const selectMeasurePerDimension = <
    TData extends Record<string, string | null>,
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    data: TData[] | null | undefined,
    query: ReportingQuery<TCube>,
    queryV2?: BuiltQuery<TMeta>,
    isV2?: boolean,
    dimensionId?: string, // TODO(Nicolas): dimension should not be optional
) => {
    if (data === null || data === undefined) return null

    const measure =
        isV2 && queryV2?.measures
            ? (queryV2.measures[0] as TCube['measures'])
            : query.measures[0]
    const dimension =
        isV2 && queryV2?.dimensions
            ? (queryV2.dimensions[0] as TCube['dimensions'])
            : query.dimensions[0]
    if (!dimensionId || !measure || !dimension) {
        return { value: null, decile: null, allData: data }
    }

    const dataMeasure =
        data.find((row) => row[dimension] === dimensionId) ?? null

    const metric = dataMeasure?.[measure] ?? null
    const decile = dataMeasure?.['decile'] ?? null

    const parseNumber = (value: string | null): number | null => {
        if (value === null) return null
        const parsed = parseFloat(value)
        return isNaN(parsed) ? null : parsed
    }

    return {
        value: parseNumber(metric),
        decile: parseNumber(decile),
        allData: data,
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
    <TCube extends Cubes, TMeta extends ScopeMeta>(
        query: ReportingQuery<TCube>,
        newQuery?: BuiltQuery<TMeta>,
        migrationStage?: MigrationStage,
    ) =>
    () =>
        metricExecutionHandler<QueryReturnType<TCube>, TCube, TMeta>(
            {
                metricName: query.metricName,
                oldPayload: [query],
                newPayload: newQuery,
            },
            migrationStage,
        ).then(withDeciles)

export function useMetricPerDimension<TCube extends Cubes>(
    query: ReportingQuery<TCube>,
    dimensionId?: string,
    enabled?: boolean,
): MetricWithDecile<TCube> {
    const migrationStage = useGetNewStatsFeatureFlagMigration(query.metricName)
    const metricData = usePostReporting<
        QueryReturnType<TCube>,
        MetricWithDecileData<TCube>
    >([query], {
        select: (data) =>
            selectMeasurePerDimension(
                data.data.data,
                query,
                undefined,
                undefined,
                dimensionId,
            ),
        queryFn: queryWithDeciles(query, undefined, migrationStage),
        enabled,
    })

    return handleDataOnError(metricData)
}

export function useMetricPerDimensionV2<
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    query: ReportingQuery<TCube>,
    newQuery?: BuiltQuery<TMeta>,
    dimensionId?: string,
    enabled?: boolean,
): MetricWithDecile<TCube> {
    const migrationStage = useGetNewStatsFeatureFlagMigration(query.metricName)
    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

    const metricData = usePostReportingV2<
        QueryReturnType<TCube>,
        MetricWithDecileData<TCube>,
        TCube,
        TMeta
    >([query], newQuery, {
        select: (data) =>
            selectMeasurePerDimension(
                data.data.data,
                query,
                newQuery,
                isV2,
                dimensionId,
            ),
        queryFn: queryWithDeciles(query, newQuery),
        enabled,
    })

    return handleDataOnError(metricData)
}

export const fetchMetricPerDimension = async <TCube extends Cubes>(
    query: ReportingQuery<TCube>,
    dimensionId?: string,
): Promise<MetricWithDecile<TCube>> => {
    return fetchPostReporting<QueryReturnType<TCube>>([query], {
        queryFn: queryWithDeciles(query),
    })
        .then((res) => ({
            data: selectMeasurePerDimension(
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
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    query: ReportingQuery<TCube>,
    newQuery?: BuiltQuery<TMeta>,
    dimensionId?: string,
): Promise<MetricWithDecile<TCube>> => {
    const migrationStage = await getNewStatsFeatureFlagMigration(
        query.metricName,
    )
    const isV2 = migrationStage === 'complete' || migrationStage === 'live'
    return fetchPostReportingV2<
        QueryReturnType<TCube>,
        MetricWithDecileData<TCube>,
        TCube,
        TMeta
    >([query], newQuery, {
        queryFn: queryWithDeciles(query, newQuery),
    })
        .then((res) => ({
            data: selectMeasurePerDimension(
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

export function useMetricPerDimensionWithBreakdown(
    query: CustomFieldsReportingQuery,
): MetricWithBreakdown {
    const metricData = usePostReporting<
        WithChildren<TicketCustomFieldsTicketCountData>[],
        WithChildren<TicketCustomFieldsTicketCountData>[]
    >([query], {
        select: (data) => {
            return data.data.data
        },
        queryFn: () =>
            postReportingV1<WithChildren<TicketCustomFieldsTicketCountData[]>>([
                query,
            ]).then((data) =>
                withBreakdown(
                    data,
                    query['dimensions'][0],
                    query['measures'][0],
                ),
            ),
        queryKey: ['reporting', 'post-reporting-breakdown', query],
    })

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
            select: (data) =>
                selectMeasurePerDimension(
                    data.data.data,
                    query,
                    undefined,
                    undefined,
                    dimensionId,
                ),
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
