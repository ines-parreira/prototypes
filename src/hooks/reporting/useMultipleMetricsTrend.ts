import {Cubes} from 'models/reporting/cubes'
import {usePostReporting} from 'models/reporting/queries'
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

export const useMultipleMetricsTrends = <TCube extends Cubes>(
    currentPeriodQuery: ReportingQuery<TCube>,
    previousPeriodQuery: ReportingQuery<TCube>
): MultipleMetricsTrend<TCube> => {
    const currentMetrics = usePostReporting<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube
    >([currentPeriodQuery], {
        select: (data) => data.data.data[0],
    })

    const previousMetrics = usePostReporting<
        Record<TCube['measures'], string>[],
        Record<TCube['measures'], string>,
        TCube
    >([previousPeriodQuery], {select: (data) => data.data.data[0]})

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
