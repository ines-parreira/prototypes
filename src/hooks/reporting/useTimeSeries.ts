import moment from 'moment-timezone'

import {formatReportingQueryDate} from 'utils/reporting'
import {usePostReporting} from 'models/reporting/queries'
import {
    ReportingGranularity,
    ReportingQuery,
    ReportingTimeDimension,
} from 'models/reporting/types'

export type TimeSeriesQuery = Omit<ReportingQuery, 'timeDimensions'> & {
    timeDimensions: [Required<ReportingTimeDimension>]
}

export type TimeSeriesDataItem = {
    dateTime: string
    value: number
    label?: string
}

export default function useTimeSeries(query: TimeSeriesQuery) {
    const {timeDimensions, measures} = query
    const {dimension, dateRange, granularity} = timeDimensions[0]
    return usePostReporting<
        Partial<Record<string, string>>[],
        TimeSeriesDataItem[][]
    >([query], {
        select: (res) => {
            const dateTimeToValuesMap = res.data.data.reduce<
                Partial<Record<string, number[]>>
            >((acc, item) => {
                const key = formatReportingQueryDate(item[dimension]!)
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
