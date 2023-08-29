import {withDeciles} from 'hooks/reporting/withDeciles'
import {usePostReporting} from 'models/reporting/queries'
import {postReporting} from 'models/reporting/resources'
import {
    ReportingDimension,
    ReportingMeasure,
    ReportingQuery,
} from 'models/reporting/types'

type Requested = {
    isFetching: boolean
    isError: boolean
}

export type ReportingMetricItem = Partial<
    Record<ReportingMeasure | ReportingDimension | 'decile', string | null>
>

export type MetricWithDecile = Requested & {
    data: {
        value: number | null
        decile: number | null
        allData: QueryReturnType
    } | null
}

export type QueryReturnType = ReportingMetricItem[]

const selectMeasurePerDimension = (
    measure: ReportingMeasure,
    dimension: ReportingDimension,
    dimensionId: string,
    data?: QueryReturnType
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
    (query: ReportingQuery, dimensionId: string) => (data: QueryReturnType) =>
        selectMeasurePerDimension(
            query.measures[0],
            query.dimensions[0],
            String(dimensionId),
            data
        )

export function useMetricPerDimension(
    query: ReportingQuery,
    dimensionId?: string
): MetricWithDecile {
    const metricData = usePostReporting<QueryReturnType, QueryReturnType>(
        [query],
        {
            select: (data) => data.data.data,
            queryFn: () =>
                postReporting<QueryReturnType>([query]).then(withDeciles),
        }
    )

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
