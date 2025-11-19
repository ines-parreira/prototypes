import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting//models/scopes/scope'
import type { RequestedData } from 'domains/reporting/hooks/types'
import type { TicketCustomFieldsTicketCountData } from 'domains/reporting/hooks/withBreakdown'
import { withBreakdown } from 'domains/reporting/hooks/withBreakdown'
import { withDeciles } from 'domains/reporting/hooks/withDeciles'
import type {
    IDRecord,
    MergedRecord,
} from 'domains/reporting/hooks/withEnrichment'
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
import type { CustomFieldsReportingQuery } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    postEnrichedReporting,
    postReportingV1,
} from 'domains/reporting/models/resources'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    EnrichmentFields,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import type { OrderDirection } from 'models/api/types'
import type { DrillDownReportingQuery } from 'models/job/types'
import type { WithChildren } from 'pages/common/components/table/TableBodyRowExpandable'

import type { DimensionName, MeasureName } from '../models/scopes/types'

export type ReportingMetricItemValue = string | number | null

/**  TODO(Anissa)
 * Temporary type until V2 migration is complete
 * We can remove this type and use number instead
 * We should check every usage of this type and replace it with number
 **/
export type StringWhichShouldBeNumber = string

export type ReportingMetricItem<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = Record<TCube['measures'][0] | TCube['dimensions'][0] | 'decile', TValue>

export type MetricWithDecileData<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = {
    value: number | null
    decile: number | null
    allData: ReportingMetricItem<TValue, TCube>[]
    dimensions?: readonly DimensionName[] | TCube['dimensions'][]
    measures?: readonly MeasureName[] | TCube['measures'][]
} | null

export type MetricWithDecile<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = RequestedData & {
    data: MetricWithDecileData<TValue, TCube>
}

export type MetricWithDecileFetch<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) => Promise<MetricWithDecile<TValue, TCube>>

export type MetricPerDimensionTrend<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = RequestedData & {
    data: {
        value: QueryReturnType<TValue, TCube>
        prevValue: QueryReturnType<TValue, TCube>
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

export type QueryReturnType<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = ReportingMetricItem<TValue, TCube>[]

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
        !dimensionId ||
        !measures.length ||
        !dimensions.length ||
        data === null ||
        data === undefined
    ) {
        return {
            value: null,
            decile: null,
            allData: data ?? [],
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
