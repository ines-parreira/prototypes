export const DurationInMs = {
    OneSecond: 1 * 1000,
    FiveSeconds: 5 * 1000,
    ThirtySeconds: 30 * 1000,
    OneMinute: 60 * 1000,
    FiveMinutes: 5 * 60 * 1000,
    FifteenMinutes: 15 * 60 * 1000,
    ThirtyMinutes: 30 * 60 * 1000,
    OneHour: 60 * 60 * 1000,
    OneDay: 24 * 60 * 60 * 1000,
    OneWeek: 7 * 24 * 60 * 60 * 1000,
    OneMonth: 30 * 24 * 60 * 60 * 1000,
    OneYear: 365 * 24 * 60 * 60 * 1000,
} as const

export enum DateFormatType {
    en_GB = 'en_GB',
    en_US = 'en_US',
}

export enum TimeFormatType {
    TwentyFourHour = '24-hour',
    AmPm = 'AM/PM',
}

export enum DateAndTimeFormatting {
    Time,
    TimeDoubleDigitHour,
    TimeHour,
    CompactDate,
    CompactDateWithTime,
    ShortDate,
    ShortDateWithOrdinalSuffixDay,
    ShortDateWithDayOfWeek,
    ShortDateWithYear,
    ShortDateWithYearAndOrdinalSuffixDay,
    ShortDateWithDayOfWeekAndYear,
    ShortMonthDayWithTime,
    LongDate,
    LongDateWithDayOfWeek,
    LongDateWithYear,
    LongDateWithYearAndTime,
    MonthAndYearShort,
    MonthAndYearLong,
    RelativeDateAndTime,
}

export enum DateTimeFormatType {
    TIME_24HOUR,
    TIME_AM_PM,
    TIME_DOUBLE_DIGIT_HOUR_24HOUR,
    TIME_DOUBLE_DIGIT_HOUR_AM_PM,
    TIME_HOUR_TWENTY_FOUR_HOUR,
    TIME_HOUR_AM_PM,
    COMPACT_DATE_EN_GB,
    COMPACT_DATE_EN_US,
    COMPACT_DATE_WITH_TIME_EN_GB_24_HOUR,
    COMPACT_DATE_WITH_TIME_EN_GB_AM_PM,
    COMPACT_DATE_WITH_TIME_EN_US_24_HOUR,
    COMPACT_DATE_WITH_TIME_EN_US_AM_PM,
    SHORT_DATE_EN_GB,
    SHORT_DATE_EN_US,
    SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_GB,
    SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_US,
    SHORT_DATE_WITH_DAY_OF_WEEK_EN_GB,
    SHORT_DATE_WITH_DAY_OF_WEEK_EN_US,
    SHORT_DATE_WITH_YEAR_EN_GB,
    SHORT_DATE_WITH_YEAR_EN_US,
    SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_GB,
    SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_US,
    SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_GB,
    SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_US,
    LONG_DATE_EN_GB,
    LONG_DATE_EN_US,
    LONG_DATE_WITH_DAY_OF_WEEK_EN_GB,
    LONG_DATE_WITH_DAY_OF_WEEK_EN_US,
    LONG_DATE_WITH_DAY_OF_WEEK_WITH_YEAR_EN_GB,
    LONG_DATE_WITH_DAY_OF_WEEK_WITH_YEAR_EN_US,
    LONG_DATE_WITH_YEAR_EN_GB,
    LONG_DATE_WITH_YEAR_EN_US,
    LONG_DATE_WITH_YEAR_AND_TIME_EN_GB_24_HOUR,
    LONG_DATE_WITH_YEAR_AND_TIME_EN_GB_AM_PM,
    LONG_DATE_WITH_YEAR_AND_TIME_EN_US_24_HOUR,
    LONG_DATE_WITH_YEAR_AND_TIME_EN_US_AM_PM,
    MONTH_AND_YEAR_SHORT,
    MONTH_AND_YEAR_LONG,
    RELATIVE_DATE_AND_TIME_EN_GB_24_HOUR,
    RELATIVE_DATE_AND_TIME_EN_GB_AM_PM,
    RELATIVE_DATE_AND_TIME_EN_US_24_HOUR,
    RELATIVE_DATE_AND_TIME_EN_US_AM_PM,
    SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_US,
    SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_GB,
}

export type DateTimeResultFormatType =
    | string
    | {
          sameDay: string
          nextDay: string
          lastDay: string
          nextWeek: string
          lastWeek: string
          sameElse: string
      }

type EnumDictionary<T extends DateTimeFormatType, U> = {
    [K in T]: U
}

export const DateTimeFormatMapper: EnumDictionary<
    DateTimeFormatType,
    DateTimeResultFormatType
> = {
    [DateTimeFormatType.TIME_24HOUR]: 'H:mm',
    [DateTimeFormatType.TIME_AM_PM]: 'h:mm A',
    [DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_24HOUR]: 'HH:mm',
    [DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_AM_PM]: 'hh:mm A',
    [DateTimeFormatType.TIME_HOUR_TWENTY_FOUR_HOUR]: 'H:[00]',
    [DateTimeFormatType.TIME_HOUR_AM_PM]: 'h A',
    [DateTimeFormatType.COMPACT_DATE_EN_GB]: 'DD/MM/YYYY',
    [DateTimeFormatType.COMPACT_DATE_EN_US]: 'MM/DD/YYYY',
    [DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_GB_24_HOUR]:
        'DD/MM/YYYY HH:mm',
    [DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_GB_AM_PM]:
        'DD/MM/YYYY hh:mm A',
    [DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_US_24_HOUR]:
        'MM/DD/YYYY HH:mm',
    [DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_US_AM_PM]:
        'MM/DD/YYYY hh:mm A',
    [DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_US]:
        'MMM D [at] h:mm a',
    [DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_GB]:
        'D MMM [at] h:mm a',
    [DateTimeFormatType.SHORT_DATE_EN_GB]: 'D MMM',
    [DateTimeFormatType.SHORT_DATE_EN_US]: 'MMM D',
    [DateTimeFormatType.SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_GB]: 'Do MMM',
    [DateTimeFormatType.SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_US]: 'MMM Do',
    [DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_EN_GB]: 'ddd, D MMM',
    [DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_EN_US]: 'ddd, MMM D',
    [DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_GB]: 'D MMM, YYYY',
    [DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US]: 'MMM D, YYYY',
    [DateTimeFormatType.SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_GB]:
        'Do MMM, YY',
    [DateTimeFormatType.SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_US]:
        'MMM Do, YY',
    [DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_GB]:
        'ddd, D MMM, YYYY',
    [DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_US]:
        'ddd, MMM D, YYYY',
    [DateTimeFormatType.LONG_DATE_EN_GB]: 'D MMMM',
    [DateTimeFormatType.LONG_DATE_EN_US]: 'MMMM D',
    [DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_EN_GB]: 'dddd, D MMMM',
    [DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_EN_US]: 'dddd, MMMM D',
    [DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_WITH_YEAR_EN_GB]:
        'dddd, D MMMM YYYY',
    [DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_WITH_YEAR_EN_US]:
        'dddd, MMMM D YYYY',
    [DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_GB]: 'D MMMM, YYYY',
    [DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US]: 'MMMM D, YYYY',
    [DateTimeFormatType.LONG_DATE_WITH_YEAR_AND_TIME_EN_GB_24_HOUR]:
        'D MMMM, YYYY HH:mm',
    [DateTimeFormatType.LONG_DATE_WITH_YEAR_AND_TIME_EN_GB_AM_PM]:
        'D MMMM, YYYY hh:mm A',
    [DateTimeFormatType.LONG_DATE_WITH_YEAR_AND_TIME_EN_US_24_HOUR]:
        'MMMM D, YYYY HH:mm',
    [DateTimeFormatType.LONG_DATE_WITH_YEAR_AND_TIME_EN_US_AM_PM]:
        'MMMM D, YYYY hh:mm A',
    [DateTimeFormatType.MONTH_AND_YEAR_SHORT]: "MMM[']YY",
    [DateTimeFormatType.MONTH_AND_YEAR_LONG]: 'MMMM YYYY',
    [DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_GB_24_HOUR]: {
        sameDay: '[Today at] H:mm',
        nextDay: '[Tomorrow at] H:mm',
        lastDay: '[Yesterday at] H:mm',
        nextWeek: 'dddd [at] H:mm',
        lastWeek: 'dddd',
        sameElse: 'DD/MM/YYYY',
    },
    [DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_GB_AM_PM]: {
        sameDay: '[Today at] h:mm A',
        nextDay: '[Tomorrow at] h:mm A',
        lastDay: '[Yesterday at] h:mm A',
        nextWeek: 'dddd [at] h:mm A',
        lastWeek: 'dddd',
        sameElse: 'DD/MM/YYYY',
    },
    [DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_US_24_HOUR]: {
        sameDay: '[Today at] H:mm',
        nextDay: '[Tomorrow at] H:mm',
        lastDay: '[Yesterday at] H:mm',
        nextWeek: 'dddd [at] H:mm',
        lastWeek: 'dddd',
        sameElse: 'MM/DD/YYYY',
    },
    [DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_US_AM_PM]: {
        sameDay: '[Today at] h:mm A',
        nextDay: '[Tomorrow at] h:mm A',
        lastDay: '[Yesterday at] h:mm A',
        nextWeek: 'dddd [at] h:mm A',
        lastWeek: 'dddd',
        sameElse: 'MM/DD/YYYY',
    },
}
