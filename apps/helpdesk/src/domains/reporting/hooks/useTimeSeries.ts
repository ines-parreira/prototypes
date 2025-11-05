import { UseQueryResult } from '@tanstack/react-query'
import _groupBy from 'lodash/groupBy'
import moment from 'moment-timezone'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { BREAKDOWN_FIELD } from 'domains/reporting/hooks/withBreakdown'
import { DataResponse } from 'domains/reporting/hooks/withDeciles'
import { Cubes } from 'domains/reporting/models/cubes'
import {
    fetchPostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { BuiltQuery, ScopeMeta } from 'domains/reporting/models/scopes/scope'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingGranularity,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

export type TimeSeriesHook = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => Pick<
    UseQueryResult<TimeSeriesDataItem[][]>,
    'data' | 'isError' | 'isFetching'
>

export type TimeSeriesPerDimensionHook = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => UseQueryResult<TimeSeriesPerDimension>

export type TimeSeriesFetch = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => Promise<TimeSeriesDataItem[][]>

export type TimeSeriesPerDimensionFetch = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => Promise<TimeSeriesPerDimension>

export type TimeSeriesDataItem = {
    dateTime: string
    value: number
    label?: string
    rawData?: any
    [key: string]: any
}

export type TimeSeriesDataItemWithPercentageAndDecile = TimeSeriesDataItem & {
    percentage: number
    decile: number
    totalsDecile: number
}

export type TimeSeriesResult = Omit<
    UseQueryResult<TimeSeriesDataItem[][]>,
    'data'
> & {
    data: TimeSeriesDataItem[][]
}

const select =
    <TCube extends Cubes>(query: TimeSeriesQuery<TCube>) =>
    (res: DataResponse['data']['data']) => {
        const { timeDimensions, measures } = query
        const { dimension, dateRange, granularity } = timeDimensions[0]

        const dateTimeToValuesMap = res.reduce<
            Partial<Record<string, { values: number[]; rawData: any }>>
        >((acc, item) => {
            const key = formatReportingQueryDate(item[String(dimension)])
            const values = measures.map((measure) =>
                parseFloat(item[measure] || '0'),
            )
            acc[key] = { values, rawData: item }
            return acc
        }, {})

        const dateTimes = getPeriodDateTimes(dateRange, granularity)
        return measures.map((_, index) => {
            return dateTimes.map((dateTime) => {
                const entry = dateTimeToValuesMap[dateTime]
                const values = entry?.values || []
                const rawData = entry?.rawData
                return {
                    dateTime,
                    value: values[index] || 0,
                    label: measures[index],
                    rawData, // Include all properties from the raw data in a separate property
                }
            })
        })
    }

const objectMap = <T, S>(
    obj: Record<string, T>,
    fn: (o: T) => S,
): Record<string, S> => {
    const mapped: Record<string, S> = {}
    Object.keys(obj).forEach((key) => (mapped[key] = fn(obj[key])))
    return mapped
}

export type TimeSeriesPerDimension = Record<string, TimeSeriesDataItem[][]>

const selectPerDimension =
    <TCube extends Cubes>(query: TimeSeriesQuery<TCube>) =>
    (res: DataResponse['data']['data']): TimeSeriesPerDimension => {
        const { dimensions } = query
        let escapedResponse = res
        const dimension = dimensions[0]

        if (dimension === BREAKDOWN_FIELD) {
            escapedResponse = res.map((item) => {
                return {
                    ...item,
                    [BREAKDOWN_FIELD]: stripEscapedQuotes(
                        item[BREAKDOWN_FIELD],
                    ),
                }
            })
        }

        return objectMap(_groupBy(escapedResponse, dimension), select(query))
    }

const selectTimeSeriesByMeasures = <TCube extends Cubes>(
    query: TimeSeriesQuery<TCube>,
    result: DataResponse,
): TimeSeriesDataItem[][] => {
    let matchingArray: TimeSeriesDataItem[][] = []

    const dataItems = select<TCube>(query)(result.data.data)

    query.measures.forEach((measure, index) => {
        const dataItem = dataItems.find((arr) =>
            arr.some((item) => item.label === measure),
        )
        if (dataItem) {
            matchingArray[index] = dataItem
        }
    })

    return matchingArray
}

/**
 * @param query - The query to use
 * @param queryV2 - The query to use for the v2 API
 * @returns Returns an array of timeSeries for each measure in the query, preserving the same order as the measures appear in the query.
 * @description This hook is used to fetch time series data from the reporting API V1 if QueryV2 is not provided, otherwise it uses the v2 API.
 */
export function useTimeSeries<TCube extends Cubes, TMeta extends ScopeMeta>(
    query: TimeSeriesQuery<TCube>,
    queryV2?: BuiltQuery<TMeta>,
): TimeSeriesResult {
    const result = usePostReportingV2<
        Record<string, string>[],
        TimeSeriesDataItem[][],
        TCube,
        TMeta
    >([query], queryV2, {
        select: (res) => selectTimeSeriesByMeasures<TCube>(query, res),
    })

    return {
        ...result,
        data: result.data ?? [[]],
    }
}

export async function fetchTimeSeries<TCube extends Cubes>(
    query: TimeSeriesQuery<TCube>,
): Promise<TimeSeriesDataItem[][]> {
    return fetchPostReporting<
        Record<string, string>[],
        TimeSeriesDataItem[][],
        TCube
    >([query], {}).then((res) => selectTimeSeriesByMeasures<TCube>(query, res))
}

export function useTimeSeriesPerDimension<
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(query: TimeSeriesQuery<TCube>, newQuery?: BuiltQuery<TMeta>, enabled = true) {
    return usePostReportingV2<
        Record<string, string>[],
        Record<string, TimeSeriesDataItem[][]>,
        TCube,
        TMeta
    >([query], newQuery, {
        select: (res) => selectPerDimension<TCube>(query)(res.data.data),
        enabled,
    })
}

export async function fetchTimeSeriesPerDimension<TCube extends Cubes>(
    query: TimeSeriesQuery<TCube>,
) {
    return fetchPostReporting<
        Record<string, string>[],
        Record<string, TimeSeriesDataItem[][]>,
        TCube
    >([query], {}).then((res) =>
        selectPerDimension<TCube>(query)(res.data.data),
    )
}

export const getMomentGranularityFromReportingGranularity = (
    granularity: ReportingGranularity,
) => (granularity === ReportingGranularity.Week ? 'isoWeek' : granularity)

export function getPeriodDateTimes(
    dateRange: string[],
    granularity: ReportingGranularity,
): string[] {
    // Cube always returns weeks starting with Monday,
    // but Moment.js derives the starting day of the week from
    // locale which in our case is `currentUser.language`.
    // By setting the granularity to isoWeek, we make sure that
    // start of the week returned by Moment.js is also Monday.
    const momentGranularity =
        getMomentGranularityFromReportingGranularity(granularity)

    const dates = []
    const end = moment(dateRange[1])
    let currentDate = moment(dateRange[0])
    while (currentDate.isBefore(end)) {
        dates.push(
            formatReportingQueryDate(currentDate.startOf(momentGranularity)),
        )
        currentDate = currentDate.add(1, granularity)
    }
    return dates
}
