import {Cubes} from 'models/reporting/cubes'
import {
    fetchPostReporting,
    usePostReporting,
    UsePostReportingQueryData,
} from 'models/reporting/queries'
import {ReportingQuery} from 'models/reporting/types'

export type MultipleMetricsData<TCube extends Cubes> = Record<
    TCube['measures'],
    {
        value: number | null
        prevValue: number | null
    }
>

export type MultipleMetricsTrend<TCube extends Cubes> = {
    isFetching: boolean
    isError: boolean
    data: MultipleMetricsData<TCube>
}

const multipleMetricsSelect = <TCube extends Cubes>(
    data: UsePostReportingQueryData<Record<TCube['measures'], string>[]>
) => data.data.data[0]

export const useMultipleMetricsTrends = <TCube extends Cubes>(
    currentPeriodQuery: ReportingQuery<TCube>,
    previousPeriodQuery: ReportingQuery<TCube>
): MultipleMetricsTrend<TCube> => {
    const currentMetrics = usePostReporting<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube
    >([currentPeriodQuery], {
        select: multipleMetricsSelect,
    })

    const previousMetrics = usePostReporting<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube
    >([previousPeriodQuery], {select: multipleMetricsSelect})

    const data = currentPeriodQuery.measures.reduce((acc, measure) => {
        acc[measure] = {
            value: currentMetrics.data?.[measure]
                ? parseFloat(currentMetrics.data[measure])
                : null,
            prevValue: previousMetrics.data?.[measure]
                ? parseFloat(previousMetrics.data[measure])
                : null,
        }
        return acc
    }, {} as MultipleMetricsData<TCube>)

    return {
        isFetching: currentMetrics.isFetching || previousMetrics.isFetching,
        isError: currentMetrics.isError || previousMetrics.isError,
        data,
    }
}

export const fetchMultipleMetricsTrends = async <TCube extends Cubes>(
    currentPeriodQuery: ReportingQuery<TCube>,
    previousPeriodQuery: ReportingQuery<TCube>
): Promise<MultipleMetricsTrend<TCube>> => {
    const currentMetrics = fetchPostReporting<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube
    >([currentPeriodQuery])

    const previousMetrics = fetchPostReporting<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube
    >([previousPeriodQuery])

    return Promise.all([currentMetrics, previousMetrics])
        .then(([currentMetricsResult, previousMetricsResult]) => {
            const currentMetrics = multipleMetricsSelect(currentMetricsResult)
            const previousMetrics = multipleMetricsSelect(previousMetricsResult)
            const data = currentPeriodQuery.measures.reduce((acc, measure) => {
                acc[measure] = {
                    value: currentMetrics?.[measure]
                        ? parseFloat(currentMetrics[measure])
                        : null,
                    prevValue: previousMetrics?.[measure]
                        ? parseFloat(previousMetrics[measure])
                        : null,
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
                }
                return acc
            }, {} as MultipleMetricsData<TCube>),
        }))
}
