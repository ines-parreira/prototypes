import {
    DateFormatType,
    TimeFormatType,
    DateTimeFormatType,
    DateTimeFormatMapper,
    DateTimeResultFormatType,
    DateAndTimeFormatting,
} from 'constants/datetime'

/**
 * Returns the date and time format based on the date and time settings and the format type.
 * */
export function getDateAndTimeFormat(
    dateSetting: DateFormatType,
    timeSetting: TimeFormatType,
    formatType = DateAndTimeFormatting.RelativeDateAndTime
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
