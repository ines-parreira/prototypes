import _groupBy from 'lodash/groupBy'
import moment from 'moment-timezone'
import {DataResponse} from 'hooks/reporting/withDeciles'
import {Cubes} from 'models/reporting/cubes'
import {usePostReporting} from 'models/reporting/queries'
import {ReportingGranularity, TimeSeriesQuery} from 'models/reporting/types'

import {formatReportingQueryDate} from 'utils/reporting'

export type TimeSeriesDataItem = {
    dateTime: string
    value: number
    label?: string
}

export type TimeSeriesDataItemWithPercentageAndDecile = TimeSeriesDataItem & {
    percentage: number
    decile: number
    totalsDecile: number
}

const select =
    <TCube extends Cubes>(query: TimeSeriesQuery<TCube>) =>
    (res: DataResponse['data']['data']) => {
        const {timeDimensions, measures} = query
        const {dimension, dateRange, granularity} = timeDimensions[0]

        const dateTimeToValuesMap = res.reduce<
            Partial<Record<string, number[]>>
        >((acc, item) => {
            const key = formatReportingQueryDate(item[String(dimension)]!)
            const values = measures.map((measure) =>
                parseFloat(item[measure] || '0')
            )
            return {
                ...acc,
                [key]: values,
            }
        }, {})
        const dateTimes = getPeriodDateTimes(dateRange, granularity)
        return measures.map((_, index) => {
            return dateTimes.map((dateTime) => {
                const values = dateTimeToValuesMap[dateTime] || []
                return {
                    dateTime,
                    value: values[index] || 0,
                    label: measures[index],
                }
            })
        })
    }

const objectMap = <T, S>(
    obj: Record<string, T>,
    fn: (o: T) => S
): Record<string, S> => {
    const mapped: Record<string, S> = {}
    Object.keys(obj).forEach((key) => (mapped[key] = fn(obj[key])))
    return mapped
}

type TimeSeriesPerDimension = Record<string, TimeSeriesDataItem[][]>

const selectPerDimension =
    <TCube extends Cubes>(query: TimeSeriesQuery<TCube>) =>
    (res: DataResponse['data']['data']): TimeSeriesPerDimension => {
        const {dimensions} = query
        return objectMap(_groupBy(res, dimensions[0]), select(query))
    }

export default function useTimeSeries<TCube extends Cubes>(
    query: TimeSeriesQuery<TCube>
) {
    return usePostReporting<
        Record<string, string>[],
        TimeSeriesDataItem[][],
        TCube
    >([query], {
        select: (res) => select<TCube>(query)(res.data.data),
    })
}

export function useTimeSeriesPerDimension<TCube extends Cubes>(
    query: TimeSeriesQuery<TCube>
) {
    return usePostReporting<
        Record<string, string>[],
        Record<string, TimeSeriesDataItem[][]>,
        TCube
    >([query], {
        select: (res) => selectPerDimension<TCube>(query)(res.data.data),
    })
}

export function getPeriodDateTimes(
    dateRange: string[],
    granularity: ReportingGranularity
): string[] {
    // Cube always returns weeks starting with Monday,
    // but Moment.js derives the starting day of the week from
    // locale which in our case is `currentUser.language`.
    // By setting the granularity to isoWeek, we make sure that
    // start of the week returned by Moment.js is also Monday.
    const momentGranularity =
        granularity === ReportingGranularity.Week ? 'isoWeek' : granularity
    const dates = []
    const end = moment(dateRange[1])
    let currentDate = moment(dateRange[0])
    while (currentDate.isBefore(end)) {
        dates.push(
            formatReportingQueryDate(currentDate.startOf(momentGranularity))
        )
        currentDate = currentDate.add(1, granularity)
    }
    return dates
}
