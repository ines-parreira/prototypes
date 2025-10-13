import { UseQueryResult } from '@tanstack/react-query'

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
    useEnrichedPostReporting,
    UseEnrichedPostReportingQueryData,
    usePostReporting,
} from 'domains/reporting/models/queries'
import { CustomFieldsReportingQuery } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    postEnrichedReporting,
    postReporting,
} from 'domains/reporting/models/resources'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    EnrichmentFields,
    ReportingQuery,
} from 'domains/reporting/models/types'
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

export type MetricPerDimensionWithEnrichment<
    T extends string,
    ID extends string,
> = RequestedData & {
    data: {
        value: number | null
        allData: (MergedRecord<
            T,
            EnrichmentFields | EnrichmentFields.TicketId
        > &
            IDRecord<ID>)[]
    } | null
}

export type QueryReturnType<TCube extends Cubes> = ReportingMetricItem<TCube>[]

const selectMeasurePerDimension = <TCube extends Cubes = Cubes>(
    measure: TCube['measures'],
    dimension: TCube['dimensions'],
    dimensionId: string,
    data: Record<string, string | null>[],
): { value: number | null; decile: number | null } => {
    const dataMeasure =
        data?.find((row) => row[dimension] === dimensionId) || null

    const metric = (dataMeasure && dataMeasure[measure]) || null
    const decile = (dataMeasure && dataMeasure['decile']) || null

    return {
        value: metric !== null ? parseFloat(metric) : null,
        decile: decile !== null ? parseFloat(decile) : null,
    }
}

const selectMetric =
    <TCube extends Cubes>(query: ReportingQuery<TCube>, dimensionId: string) =>
    (data: Record<string, string | null>[]) =>
        selectMeasurePerDimension<TCube>(
            query.measures[0],
            query.dimensions[0],
            String(dimensionId),
            data,
        )

const formatMetricPerDimension = <
    TData extends Record<string, string | null>,
    TCube extends Cubes,
>(
    metricData: TData[],
    query: ReportingQuery<TCube>,
    dimensionId?: string,
) => ({
    ...(dimensionId
        ? selectMetric(query, dimensionId)(metricData)
        : { value: null, decile: null }),
    allData: metricData,
})

const formatMetricPerDimensionResponse = <
    TData extends Record<string, string | null>,
    TCube extends Cubes,
>(
    metricData: UseQueryResult<TData[]>,
    query: ReportingQuery<TCube>,
    dimensionId?: string,
) => ({
    isFetching: metricData.isFetching,
    isError: metricData.isError,
    data:
        metricData.data !== undefined
            ? formatMetricPerDimension<TData, TCube>(
                  metricData.data,
                  query,
                  dimensionId,
              )
            : null,
})

const queryWithDeciles =
    <TCube extends Cubes>(query: ReportingQuery<TCube>) =>
    () =>
        postReporting<QueryReturnType<TCube>>([query]).then(withDeciles)

export function useMetricPerDimension<TCube extends Cubes>(
    query: ReportingQuery<TCube>,
    dimensionId?: string,
    enabled?: boolean,
): MetricWithDecile<TCube> {
    const metricData = usePostReporting<
        QueryReturnType<TCube>,
        QueryReturnType<TCube>
    >([query], {
        select: (data) => data.data.data,
        queryFn: queryWithDeciles(query),
        enabled,
    })

    return formatMetricPerDimensionResponse(metricData, query, dimensionId)
}

export const fetchMetricPerDimension = async <TCube extends Cubes>(
    query: ReportingQuery<TCube>,
    dimensionId?: string,
): Promise<MetricWithDecile<TCube>> => {
    return fetchPostReporting<QueryReturnType<TCube>>([query], {
        queryFn: queryWithDeciles(query),
    })
        .then((res) => ({
            data: formatMetricPerDimension(res.data.data, query, dimensionId),
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
            postReporting<WithChildren<TicketCustomFieldsTicketCountData[]>>([
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

    return formatMetricPerDimensionResponse(metricData, query, dimensionId)
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
