import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'

import {
    fetchMessagesReceivedTimeSeries,
    fetchMessagesSentTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
    useMessagesReceivedTimeSeries,
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import type {
    TimeSeriesDataItem,
    TimeSeriesFetch,
    TimeSeriesHook,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    BusiestTimeOfDaysMetrics,
    DayOfWeek,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import type { AccountSettingBusinessHours } from 'state/currentAccount/types'
import { stringToDatetimeWithTimeZone } from 'utils/date'

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
        case 7:
            return DayOfWeek.SUNDAY
        default:
            return null
    }
}
const colors = {
    rangeOneColor: 'var(--analytics-heatmap-0)',
    rangeTwoColor: 'var(--analytics-heatmap-2)',
    rangeThreeColor: 'var(--analytics-heatmap-4)',
    rangeFourColor: 'var(--analytics-heatmap-6)',
    red: 'var(--feedback-error-2)',
    white: 'var(--neutral-grey-0)',
}

export const businessHoursLegend = {
    name: 'Business Hours',
    background:
        'repeating-linear-gradient' +
        `(135deg, ${colors.white}, ${colors.white} 2px, ${colors.red} 2px, ${colors.red} 4px)`,
    shape: 'square' as const,
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
            }),
    )
    return result
}

export function getAggregatedBusiestTimesOfDayData(
    data: TimeSeriesDataItem[][] | undefined,
    timeZone: string,
): {
    btodData: BTODData
    max: number
} {
    const result: BTODData = createBTODDataStruct()
    let max = 0

    data?.[0].forEach((record) => {
        const { value, dateTime } = record
        if (value > max) {
            max = value
        }
        const momentDate = stringToDatetimeWithTimeZone(dateTime, timeZone)

        const day = momentDate ? weekDayLabel(momentDate?.isoWeekday()) : null
        const hourFromDate = momentDate?.hour()

        if (day && hourFromDate !== undefined) {
            result[hourFromDate] = {
                ...result[hourFromDate],
                [day]: value + result[hourFromDate][day],
            }
        }
    })

    return { btodData: result, max }
}

type BusinessHour = {
    days: string
    from_time: string
    to_time: string
}

const startsYesterday = (
    fromTime: moment.Moment,
    targetFromTime: moment.Moment,
): boolean =>
    fromTime.isoWeekday() !== 1 && targetFromTime.isoWeekday() !== 1
        ? targetFromTime.isoWeekday() < fromTime.isoWeekday()
        : targetFromTime.isoWeekday() === 7

const endsToday = (
    fromTime: moment.Moment,
    targetToTime: moment.Moment,
): boolean => targetToTime.isoWeekday() === fromTime.isoWeekday()

const startsToday = (
    fromTime: moment.Moment,
    targetFromTime: moment.Moment,
): boolean => targetFromTime.isoWeekday() === fromTime.isoWeekday()

const endsTomorrow = (
    fromTime: moment.Moment,
    targetToTime: moment.Moment,
): boolean =>
    fromTime.isoWeekday() !== 7
        ? targetToTime.isoWeekday() > fromTime.isoWeekday()
        : targetToTime.isoWeekday() === 1

const startsTomorrow = (
    fromTime: moment.Moment,
    targetFromTime: moment.Moment,
): boolean =>
    fromTime.isoWeekday() !== 7
        ? targetFromTime.isoWeekday() > fromTime.isoWeekday()
        : targetFromTime.isoWeekday() === 1

const BUSINESS_HOUR_TIME_FORMAT = 'HH:mm'
const format = (date: Moment) => date.format(BUSINESS_HOUR_TIME_FORMAT)
const newPeriod = (fromTime: Moment, toTime: Moment, days: number[]) => ({
    days: days.map(String).join(','),
    from_time: format(fromTime),
    to_time: format(toTime),
})

export const businessHourToNewTimeZone = (
    currentBusinessHour: BusinessHour,
    sourceTimeZone: string,
    targetTimeZone: string,
): BusinessHour[] => {
    const daysAsNumbers = currentBusinessHour.days
        .split(',')
        .map((n) => parseInt(n))
    const fromTime = moment.tz(
        currentBusinessHour.from_time,
        BUSINESS_HOUR_TIME_FORMAT,
        sourceTimeZone,
    )
    const targetFromTime = fromTime.clone().tz(targetTimeZone)
    const toTime = moment.tz(
        currentBusinessHour.to_time,
        BUSINESS_HOUR_TIME_FORMAT,
        sourceTimeZone,
    )
    const targetToTime = toTime.clone().tz(targetTimeZone)

    const newPeriods: BusinessHour[] = []
    if (
        startsYesterday(fromTime, targetFromTime) &&
        endsToday(fromTime, targetToTime)
    ) {
        newPeriods.push(
            newPeriod(
                targetFromTime,
                targetFromTime.clone().hour(23).minutes(59),
                daysAsNumbers.map((day) => (day !== 1 ? day - 1 : 7)),
            ),
            newPeriod(
                targetToTime.clone().startOf('day'),
                targetToTime,
                daysAsNumbers,
            ),
        )
    } else if (
        startsToday(fromTime, targetFromTime) &&
        endsToday(fromTime, targetToTime)
    ) {
        newPeriods.push(newPeriod(targetFromTime, targetToTime, daysAsNumbers))
    } else if (
        startsToday(fromTime, targetFromTime) &&
        endsTomorrow(fromTime, targetToTime)
    ) {
        newPeriods.push(
            newPeriod(
                targetFromTime,
                targetFromTime.clone().hour(23).minutes(59),
                daysAsNumbers,
            ),
            newPeriod(
                targetToTime.clone().startOf('day'),
                targetToTime,
                daysAsNumbers.map((day) => (day !== 7 ? day + 1 : 1)),
            ),
        )
    } else if (
        startsTomorrow(fromTime, targetFromTime) &&
        endsTomorrow(fromTime, targetToTime)
    ) {
        newPeriods.push(
            newPeriod(
                targetFromTime,
                targetToTime,
                daysAsNumbers.map((day) => (day !== 7 ? day + 1 : 1)),
            ),
        )
    }

    return newPeriods
}

export const changeBusinessHoursTimeZone = (
    businessHours: BusinessHour[],
    sourceTimeZone: string,
    targetTimeZone: string,
): BusinessHour[] => {
    return businessHours.reduce<BusinessHour[]>((acc, currentBusinessHour) => {
        const formattedNewPeriods = businessHourToNewTimeZone(
            currentBusinessHour,
            sourceTimeZone,
            targetTimeZone,
        )
        return [...acc, ...formattedNewPeriods]
    }, [])
}

export const getWorkingHoursInTimeZone = (
    businessHours: AccountSettingBusinessHours | undefined,
    timeZone: string,
) => {
    if (businessHours === undefined) {
        return getWorkingHours(businessHours)
    }

    const fromTimeZone = businessHours?.data.timezone
    const businessHoursInTimeZone = changeBusinessHoursTimeZone(
        businessHours.data.business_hours,
        fromTimeZone,
        timeZone,
    )

    return getWorkingHours({
        ...businessHours,
        data: {
            timezone: timeZone,
            business_hours: businessHoursInTimeZone,
        },
    })
}

export const getWorkingHours = (
    businessHours: AccountSettingBusinessHours | undefined,
) => {
    const result: BTODData = createBTODDataStruct()
    if (businessHours === undefined) {
        return result
    }

    businessHours.data.business_hours.forEach(
        ({ days, from_time, to_time }) => {
            let startTime = Number(from_time.slice(0, 2))
            const endTime =
                Number(to_time.slice(0, 2)) +
                (Number(to_time.slice(3, 5)) === 59 ? 1 : 0)

            while (startTime < endTime) {
                days.split(',').forEach((day) => {
                    const weekday = weekDayLabel(Number(day))
                    if (weekday) {
                        result[startTime][weekday] = 1
                    }
                })

                startTime++
            }
        },
    )
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
    metric: BusiestTimeOfDaysMetrics,
): TimeSeriesHook => {
    switch (metric) {
        case BusiestTimeOfDaysMetrics.MessagesSent:
            return useMessagesSentTimeSeries
        case BusiestTimeOfDaysMetrics.MessagesReceived:
            return useMessagesReceivedTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsReplied:
            return useTicketsRepliedTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsClosed:
            return useTicketsClosedTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsCreated:
            return useTicketsCreatedTimeSeries
    }
}

export const getMetricFetch = (
    metric: BusiestTimeOfDaysMetrics,
): TimeSeriesFetch => {
    switch (metric) {
        case BusiestTimeOfDaysMetrics.MessagesSent:
            return fetchMessagesSentTimeSeries
        case BusiestTimeOfDaysMetrics.MessagesReceived:
            return fetchMessagesReceivedTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsReplied:
            return fetchTicketsRepliedTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsClosed:
            return fetchTicketsClosedTimeSeries
        case BusiestTimeOfDaysMetrics.TicketsCreated:
            return fetchTicketsCreatedTimeSeries
    }
}

export const metrics = [
    BusiestTimeOfDaysMetrics.TicketsCreated,
    BusiestTimeOfDaysMetrics.TicketsReplied,
    BusiestTimeOfDaysMetrics.TicketsClosed,
    BusiestTimeOfDaysMetrics.MessagesSent,
    BusiestTimeOfDaysMetrics.MessagesReceived,
]

export const metricLabels: Record<BusiestTimeOfDaysMetrics, string> = {
    [BusiestTimeOfDaysMetrics.TicketsCreated]: 'Tickets Created',
    [BusiestTimeOfDaysMetrics.TicketsReplied]: 'Tickets Replied',
    [BusiestTimeOfDaysMetrics.TicketsClosed]: 'Tickets Closed',
    [BusiestTimeOfDaysMetrics.MessagesSent]: 'Messages Sent',
    [BusiestTimeOfDaysMetrics.MessagesReceived]: 'Messages Received',
}
