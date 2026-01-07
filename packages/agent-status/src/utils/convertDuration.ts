import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

/**
 * Converts duration_unit + duration_value to seconds for backward compatibility.
 *
 * @param durationUnit - The unit of time (minutes, hours, days)
 * @param durationValue - The numeric value in that unit
 * @returns Duration in seconds, or null for unlimited duration
 *
 * @example
 * convertDurationToSeconds('minutes', 30) // 1800
 * convertDurationToSeconds('hours', 2) // 7200
 * convertDurationToSeconds('days', 1) // 86400
 * convertDurationToSeconds(null, null) // null (unlimited)
 */
export function convertDurationToSeconds(
    durationUnit: CustomUserAvailabilityStatus['duration_unit'],
    durationValue: CustomUserAvailabilityStatus['duration_value'],
): number | null {
    if (
        !durationUnit ||
        durationValue === null ||
        durationValue === undefined
    ) {
        return null
    }

    const secondsMap: Record<
        NonNullable<CustomUserAvailabilityStatus['duration_unit']>,
        number
    > = {
        minutes: 60,
        hours: 3600,
        days: 86400,
    }

    return durationValue * secondsMap[durationUnit]
}
