import type { DateFormatType, TimeFormatType } from '@repo/utils'
import {
    DateFormatType as DateFormat,
    DurationInMs,
    TimeFormatType as TimeFormat,
} from '@repo/utils'
import moment from 'moment'

const { en_US, en_GB } = DateFormat
const { TwentyFourHour, AmPm } = TimeFormat

const DATE_FORMAT_DICT = {
    [en_US]: 'MM/DD/YY',
    [en_GB]: 'DD/MM/YY',
}

const TIME_FORMAT_DICT = {
    [TwentyFourHour]: 'H:mm',
    [AmPm]: 'h:mma',
}

/**
 * Formats expiration time based on distance from now, respecting user date/time preferences
 *
 * Format rules:
 * - Less than 1 day: shows time only (e.g., "2:30pm" or "14:30")
 * - 1-7 days: shows day of week and time (e.g., "Friday, 2:30pm" or "Friday, 14:30")
 * - More than 7 days: shows full date and time (e.g., "01/30/26, 2:30pm" for en_US or "30/01/26, 2:30pm" for en_GB)
 *
 * @param expiresAt - ISO 8601 datetime string when the status expires
 * @param dateFormat - User's preferred date format (en_US: MM/DD, en_GB: DD/MM)
 * @param timeFormat - User's preferred time format (12-hour AM/PM or 24-hour)
 * @param timezone - User's timezone (e.g., "America/New_York"). If not provided, UTC is used.
 * @returns Formatted expiration time string
 *
 * @example
 * // Less than 1 day away
 * formatExpirationTime('2026-01-30T14:30:00Z', DateFormatType.en_US, TimeFormatType.AmPm)
 * // Returns: "2:30pm"
 *
 * @example
 * // 3 days away
 * formatExpirationTime('2026-02-02T14:30:00Z', DateFormatType.en_US, TimeFormatType.AmPm)
 * // Returns: "Monday, 2:30pm"
 *
 * @example
 * // 10 days away with en_US format
 * formatExpirationTime('2026-02-09T14:30:00Z', DateFormatType.en_US, TimeFormatType.AmPm)
 * // Returns: "02/09/26, 2:30pm"
 *
 * @example
 * // 10 days away with en_GB format and timezone
 * formatExpirationTime('2026-02-09T14:30:00Z', DateFormatType.en_GB, TimeFormatType.TwentyFourHour, 'Europe/London')
 * // Returns: "09/02/26, 14:30"
 */
export function formatExpirationTime(
    expiresAt: string,
    dateFormat: DateFormatType = en_US,
    timeFormat: TimeFormatType = AmPm,
    timezone?: string,
): string {
    const expiryMoment = moment.utc(expiresAt)
    const now = moment.utc()

    const localExpiry = timezone ? expiryMoment.tz(timezone) : expiryMoment
    const localNow = timezone ? now.tz(timezone) : now

    const diffMs = localExpiry.diff(localNow)

    const timeFormatString = TIME_FORMAT_DICT[timeFormat]

    const isWithinOneDay = diffMs < DurationInMs.OneDay

    if (isWithinOneDay) {
        return localExpiry.format(timeFormatString)
    }

    const isWithinOneWeek = diffMs < DurationInMs.OneWeek

    if (isWithinOneWeek) {
        return localExpiry.format(`dddd, ${timeFormatString}`)
    }

    const dateFormatString = DATE_FORMAT_DICT[dateFormat]

    return localExpiry.format(`${dateFormatString}, ${timeFormatString}`)
}
