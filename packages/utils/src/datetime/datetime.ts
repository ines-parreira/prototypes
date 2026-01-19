/**
 * Datetime formatting utilities
 *
 * Migrated from: apps/helpdesk/src/utils/datetime.ts
 *
 * Note: The original file in the helpdesk app is still in use.
 * In a future PR, all usages in the helpdesk app will be updated to import from @repo/utils.
 */
import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'
import { isMoment } from 'moment/moment'

import type { DateTimeResultFormatType } from './constants'
import {
    DateAndTimeFormatting,
    DateFormatType,
    DateTimeFormatMapper,
    DateTimeFormatType,
    TimeFormatType,
} from './constants'

export type Datetime = Date | Moment | number | string

export function getDateAndTimeFormat(
    dateSetting: DateFormatType,
    timeSetting: TimeFormatType,
    formatType = DateAndTimeFormatting.RelativeDateAndTime,
): DateTimeResultFormatType {
    switch (formatType) {
        case DateAndTimeFormatting.Time:
            switch (timeSetting) {
                case TimeFormatType.TwentyFourHour:
                    return DateTimeFormatMapper[DateTimeFormatType.TIME_24HOUR]
                default:
                    // TimeFormatType.AmPm
                    return DateTimeFormatMapper[DateTimeFormatType.TIME_AM_PM]
            }
        case DateAndTimeFormatting.TimeDoubleDigitHour:
            switch (timeSetting) {
                case TimeFormatType.TwentyFourHour:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_24HOUR
                    ]
                default:
                    // TimeFormatType.AmPm
                    return DateTimeFormatMapper[
                        DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_AM_PM
                    ]
            }
        case DateAndTimeFormatting.TimeHour:
            switch (timeSetting) {
                case TimeFormatType.TwentyFourHour:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.TIME_HOUR_TWENTY_FOUR_HOUR
                    ]
                default:
                    // TimeFormatType.AmPm
                    return DateTimeFormatMapper[
                        DateTimeFormatType.TIME_HOUR_AM_PM
                    ]
            }
        case DateAndTimeFormatting.CompactDate:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.COMPACT_DATE_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType.COMPACT_DATE_EN_US
                    ]
            }
        case DateAndTimeFormatting.CompactDateWithTime:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    switch (timeSetting) {
                        case TimeFormatType.TwentyFourHour:
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .COMPACT_DATE_WITH_TIME_EN_GB_24_HOUR
                            ]
                        default:
                            // TimeFormatType.AmPm
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .COMPACT_DATE_WITH_TIME_EN_GB_AM_PM
                            ]
                    }
                default:
                    // DateFormatType.en_US:
                    switch (timeSetting) {
                        case TimeFormatType.TwentyFourHour:
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .COMPACT_DATE_WITH_TIME_EN_US_24_HOUR
                            ]
                        default:
                            // TimeFormatType.AmPm
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .COMPACT_DATE_WITH_TIME_EN_US_AM_PM
                            ]
                    }
            }
        case DateAndTimeFormatting.ShortDate:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_EN_US
                    ]
            }
        case DateAndTimeFormatting.ShortMonthDayWithTime:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_GB
                    ]
                default:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_US
                    ]
            }
        case DateAndTimeFormatting.ShortDateWithOrdinalSuffixDay:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType
                            .SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType
                            .SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_US
                    ]
            }
        case DateAndTimeFormatting.ShortDateWithDayOfWeek:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_EN_US
                    ]
            }
        case DateAndTimeFormatting.ShortDateWithYear:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
                    ]
            }
        case DateAndTimeFormatting.ShortDateWithYearAndOrdinalSuffixDay:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType
                            .SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType
                            .SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_US
                    ]
            }
        case DateAndTimeFormatting.ShortDateWithDayOfWeekAndYear:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType
                            .SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType
                            .SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_US
                    ]
            }
        case DateAndTimeFormatting.LongDate:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.LONG_DATE_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType.LONG_DATE_EN_US
                    ]
            }
        case DateAndTimeFormatting.LongDateWithDayOfWeek:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_EN_US
                    ]
            }
        case DateAndTimeFormatting.LongDateWithYear:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    return DateTimeFormatMapper[
                        DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_GB
                    ]
                default:
                    // DateFormatType.en_US
                    return DateTimeFormatMapper[
                        DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US
                    ]
            }
        case DateAndTimeFormatting.LongDateWithYearAndTime:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    switch (timeSetting) {
                        case TimeFormatType.TwentyFourHour:
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .LONG_DATE_WITH_YEAR_AND_TIME_EN_GB_24_HOUR
                            ]
                        default:
                            // TimeFormatType.AmPm
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .LONG_DATE_WITH_YEAR_AND_TIME_EN_GB_AM_PM
                            ]
                    }
                default:
                    // DateFormatType.en_US:
                    switch (timeSetting) {
                        case TimeFormatType.TwentyFourHour:
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .LONG_DATE_WITH_YEAR_AND_TIME_EN_US_24_HOUR
                            ]
                        default:
                            // TimeFormatType.AmPm
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .LONG_DATE_WITH_YEAR_AND_TIME_EN_US_AM_PM
                            ]
                    }
            }
        case DateAndTimeFormatting.MonthAndYearShort:
            return DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_SHORT]
        case DateAndTimeFormatting.MonthAndYearLong:
            return DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_LONG]
        case DateAndTimeFormatting.RelativeDateAndTime:
            switch (dateSetting) {
                case DateFormatType.en_GB:
                    switch (timeSetting) {
                        case TimeFormatType.TwentyFourHour:
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .RELATIVE_DATE_AND_TIME_EN_GB_24_HOUR
                            ]
                        default:
                            // TimeFormatType.AmPm
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .RELATIVE_DATE_AND_TIME_EN_GB_AM_PM
                            ]
                    }
                default:
                    // DateFormatType.en_US:
                    switch (timeSetting) {
                        case TimeFormatType.TwentyFourHour:
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .RELATIVE_DATE_AND_TIME_EN_US_24_HOUR
                            ]
                        default:
                            // TimeFormatType.AmPm
                            return DateTimeFormatMapper[
                                DateTimeFormatType
                                    .RELATIVE_DATE_AND_TIME_EN_US_AM_PM
                            ]
                    }
            }
    }
}

/**
 * Migrated from: apps/helpdesk/src/utils.ts
 *
 * Note: The original file in the helpdesk app is still in use.
 * In a future PR, all usages in the helpdesk app will be updated to import from @repo/utils.
 */
export function formatDatetime(
    datetime: Datetime,
    format: DateTimeResultFormatType,
    timezone?: string | null,
): string {
    try {
        let momentDate = isMoment(datetime) ? datetime : moment.utc(datetime)

        if (!isMoment(datetime)) {
            // if the input is a UNIX timestamp, force moment to interpret it as a timestamp (not automatic)
            const unix = moment.unix(datetime as any)
            if (unix.isValid()) {
                momentDate = unix
            }
        }

        if (timezone) {
            momentDate = momentDate.tz(timezone)
        }

        if (typeof format !== 'string') {
            return momentDate.calendar(null, format)
        }
        return momentDate.format(format)
    } catch (e) {
        console.error('Failed to format datetime', e, datetime, timezone)
        return String(datetime)
    }
}

/**
 * Calculate and format the current local time for a given timezone offset
 *
 * Migrated from: apps/helpdesk/src/pages/common/components/infobar/utils.ts
 */
export function getLocalTime(
    timezoneOffset: string,
    format: DateTimeResultFormatType,
): string {
    const timezoneDifference = parseInt(timezoneOffset.substring(0, 3))
    const localTime = moment.utc().utcOffset(timezoneDifference)

    return formatDatetime(localTime, format)
}

/**
 * Convert hours to seconds.
 *
 * Migrated from: apps/helpdesk/src/utils/hoursToSeconds.ts
 */
export function hoursToSeconds(hours: number | string = 0): number {
    if (typeof hours !== 'number') {
        return 0
    }

    return 60 * 60 * hours
}
