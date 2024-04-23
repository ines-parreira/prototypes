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
import {AccountSettingBusinessHours} from 'state/currentAccount/types'
import {stringToDatetimeWithTimeZone} from 'utils/date'

export const weekDayLabel = (weekDay: number) => {
    switch (weekDay) {
        case 1:
            return DayOfWeek.MONDAY
        case 2:
            return DayOfWeek.TUESDAY
        case 3:
            return DayOfWeek.WEDNESDAY
        case 4:
            return DayOfWeek.THURSDAY
        case 5:
            return DayOfWeek.FRIDAY
        case 6:
            return DayOfWeek.SATURDAY
        case 0:
            return DayOfWeek.SUNDAY
        default:
            return null
    }
}

export const hourFromHourIndex = (index: number) =>
    `${index}:00`.padStart(5, '0')

export type BTODData = Record<number, Record<DayOfWeek, number>>

const createBTODDataStruct = (): BTODData => {
    const result: BTODData = {}
    const hours = [...get24Hours()]
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
    return result
}

export function getAggregatedBusiestTimesOfDayData(
    data: TimeSeriesDataItem[][] | undefined,
    timeZone: string
): {
    btodData: BTODData
    max: number
} {
    const result: BTODData = createBTODDataStruct()
    let max = 0

    data?.[0].forEach((record) => {
        const {value, dateTime} = record
        if (value > max) {
            max = value
        }
        const momentDate = stringToDatetimeWithTimeZone(dateTime, timeZone)

        const day = momentDate ? weekDayLabel(momentDate?.weekday()) : null
        const hourFromDate = momentDate?.hour()

        if (day && hourFromDate !== undefined) {
            result[hourFromDate] = {
                ...result[hourFromDate],
                [day]: value + result[hourFromDate][day] ?? 0,
            }
        }
    })

    return {btodData: result, max}
}

export const getWorkingHours = (
    businessHours: AccountSettingBusinessHours | undefined
) => {
    const result: BTODData = createBTODDataStruct()
    if (businessHours === undefined) {
        return result
    }

    businessHours.data.business_hours.forEach(({days, from_time, to_time}) => {
        let startTime = Number(from_time.slice(0, 2))
        const endTime =
            Number(to_time.slice(0, 2)) +
            (Number(to_time.slice(3, 5)) === 59 ? 1 : 0)

        while (startTime < endTime) {
            days.split(',').forEach((day) => {
                const weekday = weekDayLabel(Number(day) - 1)
                if (weekday) {
                    result[startTime][weekday] = 1
                }
            })

            startTime++
        }
    })
    return result
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
