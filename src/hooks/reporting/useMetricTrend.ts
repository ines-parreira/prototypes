import {Cubes} from 'models/reporting/cubes'
import {
    fetchPostReporting,
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
    enabled?: boolean
) => MetricTrend

export type MetricTrendFetch = (
    statsFilters: StatsFilters,
    timezone: string,
    isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined,
    aiAgentUserId: string | undefined,
    costSavedPerInteraction: number
) => Promise<MetricTrend>

export type QueryReturnType<Measure extends Cubes['measures']> = [
    Record<Measure, string | null>,
]

export const selectMeasure = <Measure extends Cubes['measures']>(
    measure: Measure,
    data: UsePostReportingQueryData<QueryReturnType<Measure>>
) => {
    const dataMeasure = data.data.data?.[0]?.[measure] || null
    return dataMeasure !== null ? parseFloat(dataMeasure) : null
}

const getSelectMeasure =
    <Measure extends Cubes['measures']>(measure: Measure) =>
    (data: UsePostReportingQueryData<QueryReturnType<Measure>>) =>
        selectMeasure(measure, data)

export async function fetchMetricTrend<TCube extends Cubes>(
    currentPeriodQuery: ReportingQuery<TCube>,
    prevPeriodQuery: ReportingQuery<TCube>
): Promise<MetricTrend> {
    const currentPeriodMetric = fetchPostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([currentPeriodQuery])
    const prevPeriodMetric = fetchPostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([prevPeriodQuery])

    const select = getSelectMeasure(currentPeriodQuery.measures[0])

    return Promise.all([currentPeriodMetric, prevPeriodMetric])
        .then(([currentPeriodResult, previousPeriodResult]) => {
            return {
                isFetching: false,
                isError: false,
                data:
                    currentPeriodResult.data !== undefined &&
                    previousPeriodResult.data !== undefined
                        ? {
                              value: select(currentPeriodResult),
                              prevValue: select(previousPeriodResult),
                          }
                        : undefined,
            }
        })
        .catch(() => {
            return {
                isFetching: false,
                isError: true,
                data: undefined,
            }
        })
}

export default function useMetricTrend<TCube extends Cubes>(
    currentPeriodQuery: ReportingQuery<TCube>,
    prevPeriodQuery: ReportingQuery<TCube>
): MetricTrend {
    const currentPeriodMetric = usePostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([currentPeriodQuery], {
        select: getSelectMeasure(currentPeriodQuery.measures[0]),
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
