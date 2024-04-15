import {UseQueryResult} from '@tanstack/react-query'
import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {TimeSeriesDataItem, TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import {
    BusiestTimeOfDaysMetrics,
    DayOfWeek,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {stringToDatetime} from 'utils/date'

export const weekDayLabel = (weekDay: number) => {
    switch (weekDay) {
        case 0:
            return DayOfWeek.MONDAY
        case 1:
            return DayOfWeek.TUESDAY
        case 2:
            return DayOfWeek.WEDNESDAY
        case 3:
            return DayOfWeek.THURSDAY
        case 4:
            return DayOfWeek.FRIDAY
        case 5:
            return DayOfWeek.SATURDAY
        case 6:
            return DayOfWeek.SUNDAY
        default:
            return null
    }
}

export const hourFromHourIndex = (index: number) =>
    `${index}:00`.padStart(5, '0')

export type BTODData = Record<number, Record<DayOfWeek, number>>

export function getAggregatedBusiestTimesOfDayData(
    data: UseQueryResult<TimeSeriesDataItem[][]>['data']
): {
    btodData: BTODData
    max: number
} {
    const result: BTODData = {}
    const hours = [...get24Hours()]
    let max = 0

    hours.forEach(
        (hour) =>
            (result[hour] = {
                [DayOfWeek.MONDAY]: 0,
                [DayOfWeek.TUESDAY]: 0,
                [DayOfWeek.WEDNESDAY]: 0,
                [DayOfWeek.THURSDAY]: 0,
                [DayOfWeek.FRIDAY]: 0,
                [DayOfWeek.SATURDAY]: 0,
                [DayOfWeek.SUNDAY]: 0,
            })
    )

    data?.[0].forEach((record) => {
        const {value, dateTime} = record
        if (value > max) {
            max = value
        }
        const momentDate = stringToDatetime(dateTime)
        momentDate?.weekday()
        const day = momentDate
            ? weekDayLabel(momentDate?.weekday())
            : momentDate
        const hourFromDate = momentDate?.hour()
        if (day && hourFromDate) {
            result[hourFromDate] = {
                ...result[hourFromDate],
                [day]: value + result[hourFromDate][day] ?? 0,
            }
        }
    })

    return {btodData: result, max}
}

export function get24Hours() {
    const hours = []
    for (let i = 0; i < 24; i++) {
        hours.push(i)
    }
    return hours
}

export const getMetricQuery = (
    metric: BusiestTimeOfDaysMetrics
): TimeSeriesHook => {
    switch (metric) {
        case BusiestTimeOfDaysMetrics.MessagesSent:
            return useMessagesSentTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsReplied:
            return useTicketsRepliedTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsClosed:
            return useTicketsClosedTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsCreated:
            return useTicketsCreatedTimeSeries
    }
}

export const metrics = [
    BusiestTimeOfDaysMetrics.TicketsCreated,
    BusiestTimeOfDaysMetrics.TicketsReplied,
    BusiestTimeOfDaysMetrics.TicketsClosed,
    BusiestTimeOfDaysMetrics.MessagesSent,
]

export const metricLabels: Record<BusiestTimeOfDaysMetrics, string> = {
    [BusiestTimeOfDaysMetrics.TicketsCreated]: 'Tickets Created',
    [BusiestTimeOfDaysMetrics.TicketsReplied]: 'Tickets Replied',
    [BusiestTimeOfDaysMetrics.TicketsClosed]: 'Tickets Closed',
    [BusiestTimeOfDaysMetrics.MessagesSent]: 'Messages Sent',
}
