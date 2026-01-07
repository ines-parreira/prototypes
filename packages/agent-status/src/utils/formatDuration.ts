import moment from 'moment'

import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import { convertDurationToSeconds } from './convertDuration'

/**
 * Formats a duration to a human-readable string with precise measurements.
 *
 * @param durationUnit - The unit of time (minutes, hours, days) or null for unlimited
 * @param durationValue - The numeric value in that unit or null for unlimited
 * @returns A formatted duration string (e.g., "1 hour 30 minutes", "2 days 3 hours", "Unlimited")
 *
 * @example
 * formatDuration('minutes', 30) // "30 minutes"
 * formatDuration('hours', 2) // "2 hours"
 * formatDuration('hours', 1.5) // "1 hour 30 minutes"
 * formatDuration('days', 1) // "1 day"
 * formatDuration(null, null) // "Unlimited"
 */
export function formatDuration(
    durationUnit: CustomUserAvailabilityStatus['duration_unit'],
    durationValue: CustomUserAvailabilityStatus['duration_value'],
): string {
    const durationInSeconds = convertDurationToSeconds(
        durationUnit,
        durationValue,
    )
    return formatDurationInSeconds(durationInSeconds)
}

/**
 * Internal function to format duration in seconds.
 */
function formatDurationInSeconds(durationInSeconds: number | null): string {
    if (durationInSeconds === null || durationInSeconds === undefined) {
        return 'Unlimited'
    }

    if (durationInSeconds === 0) {
        return '0 minutes'
    }

    const duration = moment.duration(durationInSeconds, 'seconds')

    const years = duration.years()
    const months = duration.months()
    const days = duration.days()
    const hours = duration.hours()
    const minutes = duration.minutes()
    const seconds = duration.seconds()

    const parts: string[] = []

    if (years > 0) {
        parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
    }
    if (months > 0) {
        parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
    }
    if (days > 0) {
        parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
    }
    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
    }
    if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
    }
    if (seconds > 0) {
        parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`)
    }

    // Return the first 2 most significant units
    return parts.slice(0, 2).join(' ')
}
