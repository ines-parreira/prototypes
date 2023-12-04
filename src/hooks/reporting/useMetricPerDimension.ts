import {
    TicketCustomFieldsTicketCountData,
    withBreakdown,
} from 'hooks/reporting/withBreakdown'
import {withDeciles} from 'hooks/reporting/withDeciles'
import {
    IDRecord,
    KeyedRecord,
    MergedRecord,
    withEnrichment,
} from 'hooks/reporting/withEnrichment'
import {Cubes} from 'models/reporting/cubes'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    useEnrichedPostReporting,
    usePostReporting,
} from 'models/reporting/queries'
import {postEnrichedReporting, postReporting} from 'models/reporting/resources'
import {EnrichmentFields, ReportingQuery} from 'models/reporting/types'
import {WithChildren} from 'pages/common/components/table/TableBodyRowExpandable'

type Requested = {
    isFetching: boolean
    isError: boolean
}

export type ReportingMetricItem<TCube extends Cubes = Cubes> = Record<
    TCube['measures'][0] | TCube['dimensions'][0] | 'decile',
    string | null
>

export type MetricWithDecile<TCube extends Cubes = Cubes> = Requested & {
    data: {
        value: number | null
        decile: number | null
        allData: QueryReturnType<TCube>
    } | null
}

export type MetricWithBreakdown = Requested & {
    data: {
        allData: WithChildren<TicketCustomFieldsTicketCountData>[]
    } | null
}

export type MetricWithEnrichment<
    T extends string,
    ID extends string
> = Requested & {
    data: {
        allData: (MergedRecord<T, EnrichmentFields> & IDRecord<ID>)[]
    } | null
}

export type QueryReturnType<TCube extends Cubes> = ReportingMetricItem<TCube>[]

const selectMeasurePerDimension = <TCube extends Cubes = Cubes>(
    measure: TCube['measures'],
    dimension: TCube['dimensions'],
    dimensionId: string,
    data: QueryReturnType<TCube>
): {value: number | null; decile: number | null} => {
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
    (data: QueryReturnType<TCube>) =>
        selectMeasurePerDimension<TCube>(
            query.measures[0],
            query.dimensions[0],
            String(dimensionId),
            data
        )

export function useMetricPerDimension<TCube extends Cubes>(
    query: ReportingQuery<TCube>,
    dimensionId?: string
): MetricWithDecile<TCube> {
    const metricData = usePostReporting<
        QueryReturnType<TCube>,
        QueryReturnType<TCube>
    >([query], {
        select: (data) => data.data.data,
        queryFn: () =>
            postReporting<QueryReturnType<TCube>>([query]).then(withDeciles),
    })

    return {
        isFetching: metricData.isFetching,
        isError: metricData.isError,
        data:
            metricData.data !== undefined
                ? {
                      ...(dimensionId
                          ? selectMetric(query, dimensionId)(metricData.data)
                          : {value: null, decile: null}),
                      allData: metricData?.data,
                  }
                : null,
    }
}

export function useMetricPerDimensionWithBreakdown(
    query: ReportingQuery<HelpdeskMessageCubeWithJoins>
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
            ]).then((data) => withBreakdown(data)),
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
    query: ReportingQuery<HelpdeskMessageCubeWithJoins>,
    enrichmentFields: EnrichmentFields[]
): MetricWithEnrichment<
    typeof query['measures'][0],
    typeof query['dimensions'][0]
> {
    const idField = query.dimensions[0]
    const metricData = useEnrichedPostReporting<
        (MergedRecord<typeof query['measures'][0], EnrichmentFields> &
            IDRecord<typeof query['dimensions'][0]>)[],
        (MergedRecord<typeof query['measures'][0], EnrichmentFields> &
            IDRecord<typeof query['dimensions'][0]>)[]
    >(
        {query, enrichment: enrichmentFields},
        {
            select: (data) => {
                return data.data.data
            },
            queryFn: () =>
                postEnrichedReporting<{
                    data: (KeyedRecord<typeof query['measures'][0]> &
                        IDRecord<typeof query['dimensions'][0]>)[]
                    enrichment: (KeyedRecord<EnrichmentFields> &
                        IDRecord<typeof query['dimensions'][0]>)[]
                }>({query, enrichment: enrichmentFields}).then((data) =>
                    withEnrichment(data, idField, enrichmentFields)
                ),
        }
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
