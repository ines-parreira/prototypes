import {usePostReporting} from 'models/reporting/queries'
import {
    ReportingDimension,
    ReportingMeasure,
    ReportingQuery,
} from 'models/reporting/types'

type Requested = {
    isFetching: boolean
    isError: boolean
}

export type Metric = Requested & {
    data: {
        value: number | null
        allData: any
    } | null
}

export type QueryReturnType = [
    Record<ReportingMeasure | ReportingDimension, string | null>
]

const selectMeasurePerDimension = (
    measure: ReportingMeasure,
    dimension: ReportingDimension,
    dimensionId: string,
    data?: QueryReturnType
): number | null => {
    const dataMeasure =
        (data?.find((row) => row[dimension] === dimensionId) || {})[measure] ||
        null

    return dataMeasure != null ? parseFloat(dataMeasure) : null
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
): Metric {
    const metricData = usePostReporting<QueryReturnType, QueryReturnType>(
        [query],
        {
            select: (data) => data.data.data,
        }
    )

    return {
        isFetching: metricData.isFetching,
        isError: metricData.isError,
        data:
            metricData.data !== undefined
                ? {
                      value: dimensionId
                          ? selectMetric(query, dimensionId)(metricData.data)
                          : null,
                      allData: metricData?.data,
                  }
                : null,
    }
}
