import type { DateValue } from '@internationalized/date'
import type { ValueOf } from '@repo/types'
import moment from 'moment'

import type { Ticket } from '@gorgias/helpdesk-types'

export const TicketStatus = {
    Closed: 'closed',
    Open: 'open',
    Snoozed: 'snoozed',
} as const

export type TicketStatus = ValueOf<typeof TicketStatus>
export function getTicketStatus(ticket: Ticket): TicketStatus {
    if (
        ticket.snooze_datetime &&
        moment(ticket.snooze_datetime).isAfter(moment())
    ) {
        return TicketStatus.Snoozed
    }

    return ticket.status ?? TicketStatus.Open
}

export function getRemainingSnoozeTime(snoozeDateTime: string | null): string {
    if (!snoozeDateTime) return ''

    const now = moment()
    const snoozeTime = moment(snoozeDateTime)
    const duration = moment.duration(snoozeTime.diff(now))

    if (duration.asMilliseconds() <= 0) {
        return 'Not snoozed'
    }

    const days = Math.floor(duration.asDays())
    const hours = duration.hours()
    const minutes = duration.minutes()

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`
    }

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
    }

    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}

export function getSnoozeTooltipTitle(snoozeDateTime: string | null): string {
    if (!snoozeDateTime) return ''

    const now = moment()
    const snoozeTime = moment(snoozeDateTime)

    if (snoozeTime.isBefore(now)) {
        return 'Not snoozed'
    }

    const isToday = snoozeTime.isSame(now, 'day')
    const isTomorrow = snoozeTime.isSame(moment(now).add(1, 'day'), 'day')
    const formattedTime = snoozeTime.format('h:mmA')

    if (isToday) {
        return `Snoozed until today at ${formattedTime}`
    }

    if (isTomorrow) {
        return `Snoozed until tomorrow at ${formattedTime}`
    }

    return `Snoozed until ${snoozeTime.format('MMM D')} at ${formattedTime}`
}

export function getClosedDateTitle(closedDateTime: string | null): string {
    if (!closedDateTime) return ''

    const now = moment()
    const closedTime = moment(closedDateTime)

    const isToday = closedTime.isSame(now, 'day')
    const isYesterday = closedTime.isSame(moment(now).subtract(1, 'day'), 'day')
    const formattedTime = closedTime.format('h:mmA')

    if (isToday) {
        return `Closed today at ${formattedTime}`
    }

    if (isYesterday) {
        return `Closed yesterday at ${formattedTime}`
    }

    const daysDiff = now.diff(closedTime, 'days')

    if (daysDiff < 7) {
        return `Closed ${daysDiff} day${daysDiff > 1 ? 's' : ''} ago at ${formattedTime}`
    }

    return `Closed on ${closedTime.format('MMM D')} at ${formattedTime}`
}

export function disableDatesBeforeToday(date: DateValue): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date.toDate('UTC') < today
}
