import { Cubes } from 'domains/reporting/models/cubes'
import {
    fetchPostReporting,
    UsePostReportingQueryData,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import {
    type BuiltQuery,
    type ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'

export type MetricTrend = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
        prevValue: number | null
    }
}

export type MetricTrendWithCurrency = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
        prevValue: number | null
        currency: string
    }
}

export const isMetricTrendWithCurrency = (
    trend: MetricTrend | MetricTrendWithCurrency,
): trend is MetricTrendWithCurrency => {
    return !!(trend.data && 'currency' in trend.data)
}

export type MetricTrendHook = (
    statsFilters: StatsFilters,
    timezone: string,
    enabled?: boolean,
) => MetricTrend | MetricTrendWithCurrency

export type MetricTrendFetch = (
    statsFilters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => Promise<MetricTrend>

export type QueryReturnType<Measure extends Cubes['measures']> = [
    Record<Measure, string | null>,
]

export const selectMeasure = <Measure extends Cubes['measures']>(
    measure: Measure,
    data: UsePostReportingQueryData<QueryReturnType<Measure>>,
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
    prevPeriodQuery: ReportingQuery<TCube>,
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

export default function useMetricTrend<
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    currentPeriodQuery: ReportingQuery<TCube>,
    prevPeriodQuery: ReportingQuery<TCube>,
    currentPeriodQueryV2?: BuiltQuery<TMeta>,
    prevPeriodQueryV2?: BuiltQuery<TMeta>,
): MetricTrend {
    const currentPeriodMetric = usePostReportingV2<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube,
        TMeta
    >([currentPeriodQuery], currentPeriodQueryV2, {
        select: (data) => selectMeasure(currentPeriodQuery.measures[0], data),
    })

    const prevPeriodMetric = usePostReportingV2<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube,
        TMeta
    >([prevPeriodQuery], prevPeriodQueryV2, {
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
