import moment from 'moment-timezone'
import {Cubes} from 'models/reporting/cubes'

import {formatReportingQueryDate} from 'utils/reporting'
import {usePostReporting} from 'models/reporting/queries'
import {
    Cube,
    ReportingGranularity,
    ReportingQuery,
    ReportingTimeDimension,
} from 'models/reporting/types'

export type TimeSeriesQuery<TCube extends Cube = Cube> = Omit<
    ReportingQuery<TCube>,
    'timeDimensions'
> & {
    timeDimensions: [Required<ReportingTimeDimension<TCube['timeDimensions']>>]
}

export type TimeSeriesDataItem = {
    dateTime: string
    value: number
    label?: string
}

export default function useTimeSeries<TCube extends Cubes>(
    query: TimeSeriesQuery<TCube>
) {
    const {timeDimensions, measures} = query
    const {dimension, dateRange, granularity} = timeDimensions[0]
    return usePostReporting<
        Record<string, string>[],
        TimeSeriesDataItem[][],
        TCube
    >([query], {
        select: (res) => {
            const dateTimeToValuesMap = res.data.data.reduce<
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
        },
    })
}

function getPeriodDateTimes(
    dateRange: string[],
    granularity: ReportingGranularity
) {
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
