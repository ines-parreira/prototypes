import {
    useGetReporting,
    UseGetReportingQueryData,
} from 'models/reporting/queries'
import {ReportingMeasure, ReportingQuery} from 'models/reporting/types'

export type MetricTrend = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
        prevValue: number | null
    }
}

type QueryReturnType = [Record<ReportingMeasure, string | null>]

const selectMeasure = (
    measure: ReportingMeasure,
    data: UseGetReportingQueryData<QueryReturnType>
) => {
    const dataMeasure = data.data.data[0][measure]
    return dataMeasure != null ? parseFloat(dataMeasure) : null
}

export default function useMetricTrend(
    currentPeriodQuery: ReportingQuery,
    prevPeriodQuery: ReportingQuery
): MetricTrend {
    const currentPeriodMetric = useGetReporting<QueryReturnType, number | null>(
        [currentPeriodQuery],
        {
            select: (data) =>
                selectMeasure(currentPeriodQuery.measures[0], data),
        }
    )
    const prevPeriodMetric = useGetReporting<QueryReturnType, number | null>(
        [prevPeriodQuery],
        {
            select: (data) => selectMeasure(prevPeriodQuery.measures[0], data),
        }
    )
    return {
        isFetching:
            currentPeriodMetric.isFetching || prevPeriodMetric.isFetching,
        isError: currentPeriodMetric.isError || prevPeriodMetric.isError,
        data:
            currentPeriodMetric.data !== undefined &&
            prevPeriodMetric.data !== undefined
                ? {
                      value: currentPeriodMetric.data,
                      prevValue: prevPeriodMetric.data,
                  }
                : undefined,
    }
}
