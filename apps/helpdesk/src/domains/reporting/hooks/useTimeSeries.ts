import type { TwoDimensionalDataItem } from '@repo/reporting'
import type { UseQueryResult } from '@tanstack/react-query'
import _groupBy from 'lodash/groupBy'
import moment from 'moment-timezone'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { getPeriodDateTimesFromFilters } from 'domains/reporting/hooks/helpers'
import { BREAKDOWN_FIELD } from 'domains/reporting/hooks/withBreakdown'
import type { DataResponse } from 'domains/reporting/hooks/withDeciles'
import type { Cubes } from 'domains/reporting/models/cubes'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export type TimeSeriesHook = (
    filters: StatsFilters,
    timezone: string,
    granularity: AggregationWindow,
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
    granularity: AggregationWindow,
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

export const seriesToTwoDimensionalDataItem = (
    series: TimeSeriesDataItem[] | undefined,
    options?: {
        label?: string
        dateFormatter?: (date: string) => string
        withEndPeriod?: {
            include: boolean
            endDate: string
        }
    },
): TwoDimensionalDataItem[] => {
    if (!series) {
        return []
    }

    const groupedByLabel = _groupBy(
        series,
        (item) => options?.label ?? item.label ?? 'default',
    )

    const dateFormatter = options?.dateFormatter ?? ((date) => date)
    return Object.entries(groupedByLabel).map(([label, items]) => ({
        label,
        values: items.map((item, index) => {
            const startDate = dateFormatter(item.dateTime)

            let x: string
            if (options?.withEndPeriod?.include) {
                const nextStartDate = items[index + 1]?.dateTime
                let endDate: string
                if (nextStartDate) {
                    endDate = dateFormatter(
                        moment(nextStartDate).subtract(1, 'day').toISOString(),
                    )
                } else {
                    endDate = dateFormatter(options.withEndPeriod.endDate)
                }

                x =
                    startDate === endDate
                        ? startDate
                        : `${startDate} - ${endDate}`
            } else {
                x = startDate
            }

            return {
                x,
                y: item.value,
            }
        }),
    }))
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
    <TCube extends Cubes, TMeta extends ScopeMeta>(
        query: TimeSeriesQuery<TCube>,
        queryV2?: BuiltQuery<TMeta>,
        isV2?: boolean,
    ) =>
    (res: DataResponse['data']['data']) => {
        const timeDimensions =
            isV2 && queryV2?.time_dimensions
                ? queryV2.time_dimensions
                : query.timeDimensions
        const measures =
            isV2 && queryV2?.measures ? queryV2.measures : query.measures
        const { dimension, granularity } = timeDimensions[0]

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

        const dateTimes = getPeriodDateTimesFromFilters(
            isV2 && queryV2?.filters ? queryV2.filters : query.filters,
            granularity,
        )
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

export const objectMap = <T, S>(
    obj: Record<string, T>,
    fn: (o: T) => S,
): Record<string, S> => {
    const mapped: Record<string, S> = {}
    Object.keys(obj).forEach((key) => (mapped[key] = fn(obj[key])))
    return mapped
}

export type TimeSeriesPerDimension = Record<string, TimeSeriesDataItem[][]>

export const selectPerDimension =
    <TCube extends Cubes, TMeta extends ScopeMeta>(
        query: TimeSeriesQuery<TCube>,
        queryV2?: BuiltQuery<TMeta>,
        isV2?: boolean,
    ) =>
    (res: DataResponse['data']['data']): TimeSeriesPerDimension => {
        const dimensions =
            isV2 && queryV2?.dimensions ? queryV2.dimensions : query.dimensions
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

        return objectMap(
            _groupBy(escapedResponse, dimension),
            select(query, queryV2, isV2),
        )
    }

export const selectTimeSeriesByMeasures = <
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(
    result: DataResponse,
    query: TimeSeriesQuery<TCube>,
    queryV2?: BuiltQuery<TMeta>,
    useV2: boolean = false,
): TimeSeriesDataItem[][] => {
    let matchingArray: TimeSeriesDataItem[][] = []

    const dataItems = select<TCube, TMeta>(
        query,
        queryV2,
        useV2,
    )(result.data.data)

    const measures =
        useV2 && queryV2?.measures ? queryV2.measures : query.measures

    measures.forEach((measure, index) => {
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
    enabled = true,
): TimeSeriesResult {
    const migrationStage = useGetNewStatsFeatureFlagMigration(query.metricName)

    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

    const result = usePostReportingV2<
        Record<string, string>[],
        TimeSeriesDataItem[][],
        TCube,
        TMeta
    >([query], queryV2, {
        select: (res) =>
            selectTimeSeriesByMeasures<TCube, TMeta>(res, query, queryV2, isV2),
        enabled,
    })

    return {
        ...result,
        data: result.data ?? [[]],
    }
}

export async function fetchTimeSeries<
    TCube extends Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(query: TimeSeriesQuery<TCube>, queryV2?: BuiltQuery<TMeta>) {
    const migrationStage = await getNewStatsFeatureFlagMigration(
        query.metricName,
    )

    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

    return fetchPostReportingV2<
        Record<string, string>[],
        TimeSeriesDataItem[][],
        TCube,
        TMeta
    >([query], queryV2, {}).then((res) =>
        selectTimeSeriesByMeasures<TCube, TMeta>(res, query, queryV2, isV2),
    )
}

export function useTimeSeriesPerDimension<
    TCube extends Cubes,
    TMeta extends ScopeMeta,
>(query: TimeSeriesQuery<TCube>, newQuery?: BuiltQuery<TMeta>, enabled = true) {
    const migrationStage = useGetNewStatsFeatureFlagMigration(query.metricName)

    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

    return usePostReportingV2<
        Record<string, string>[],
        Record<string, TimeSeriesDataItem[][]>,
        TCube,
        TMeta
    >([query], newQuery, {
        select: (res) =>
            selectPerDimension<TCube, TMeta>(
                query,
                newQuery,
                isV2,
            )(res.data.data),
        enabled,
    })
}

export async function fetchTimeSeriesPerDimension<
    TCube extends Cubes,
    TMeta extends ScopeMeta = ScopeMeta,
>(query: TimeSeriesQuery<TCube>, queryV2?: BuiltQuery<TMeta>) {
    const migrationStage = await getNewStatsFeatureFlagMigration(
        query.metricName,
    )

    const isV2 = migrationStage === 'complete' || migrationStage === 'live'

    return fetchPostReportingV2<
        Record<string, string>[],
        Record<string, TimeSeriesDataItem[][]>,
        TCube,
        TMeta
    >([query], queryV2, {}).then((res) =>
        selectPerDimension<TCube, TMeta>(query, queryV2, isV2)(res.data.data),
    )
}
