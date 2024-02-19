import {useEnrichedCubes} from 'hooks/reporting/useEnrichedCubes'
import {OrderDirection} from 'models/api/types'
import {Cubes} from 'models/reporting/cubes'
import {
    usePostReporting,
    UsePostReportingQueryData,
} from 'models/reporting/queries'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export type MetricTrend = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
        prevValue: number | null
    }
}

export type MetricTrendHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) => MetricTrend

export type QueryReturnType<Measure extends Cubes['measures']> = [
    Record<Measure, string | null>
]

export const selectMeasure = <Measure extends Cubes['measures']>(
    measure: Measure,
    data: UsePostReportingQueryData<QueryReturnType<Measure>>
) => {
    const dataMeasure = data.data.data[0][measure]
    return dataMeasure != null ? parseFloat(dataMeasure) : null
}

export default function useMetricTrend<TCube extends Cubes>(
    query: ReportingQuery<TCube>,
    previousPeriodQuery: ReportingQuery<TCube>
): MetricTrend {
    const currentPeriodQuery = useEnrichedCubes(query)
    const prevPeriodQuery = useEnrichedCubes(previousPeriodQuery)

    const currentPeriodMetric = usePostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([currentPeriodQuery], {
        select: (data) => selectMeasure(currentPeriodQuery.measures[0], data),
    })
    const prevPeriodMetric = usePostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([prevPeriodQuery], {
        select: (data) => selectMeasure(prevPeriodQuery.measures[0], data),
    })
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
