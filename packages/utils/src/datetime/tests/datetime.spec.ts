import moment from 'moment-timezone'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    DateAndTimeFormatting,
    DateFormatType,
    DateTimeFormatMapper,
    DateTimeFormatType,
    TimeFormatType,
} from '../constants'
import {
    daysToHours,
    formatDatetime,
    getDateAndTimeFormat,
    getLocalTime,
    hoursToSeconds,
} from '../datetime'

describe('getDateAndTimeFormat', () => {
    const timeSetting24hour = TimeFormatType.TwentyFourHour
    const timeSettingAMPM = TimeFormatType.AmPm
    const dateSettingEnGB = DateFormatType.en_GB
    const dateSettingEnUS = DateFormatType.en_US

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.TIME_24HOUR],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.TIME_AM_PM],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.TIME_24HOUR],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.TIME_AM_PM],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.Time',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.Time,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_24HOUR
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_AM_PM
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_24HOUR
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.TIME_DOUBLE_DIGIT_HOUR_AM_PM
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.TimeDoubleDigitHour',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.TimeDoubleDigitHour,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.TIME_HOUR_TWENTY_FOUR_HOUR],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.TIME_HOUR_AM_PM],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.TIME_HOUR_TWENTY_FOUR_HOUR],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.TIME_HOUR_AM_PM],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.TimeHour',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.TimeHour,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.COMPACT_DATE_EN_GB],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.COMPACT_DATE_EN_US],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.COMPACT_DATE_EN_US],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.COMPACT_DATE_EN_GB],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.CompactDate',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.CompactDate,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_GB_24_HOUR
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_US_AM_PM
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_US_24_HOUR
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_GB_AM_PM
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.CompactDateWithTime',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.CompactDateWithTime,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_GB],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_GB],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.ShortDate',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.ShortDate,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_GB
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_US
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_US
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_ORDINAL_SUFFIX_DAY_EN_GB
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.ShortDateWithOrdinalSuffixDay',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.ShortDateWithOrdinalSuffixDay,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_EN_GB
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_EN_US
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_EN_US
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_EN_GB
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.ShortDateWithDayOfWeek',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.ShortDateWithDayOfWeek,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_GB],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_GB],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.ShortDateWithYear',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.ShortDateWithYear,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType
                    .SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_GB
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType
                    .SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_US
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType
                    .SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_US
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType
                    .SHORT_DATE_WITH_YEAR_AND_ORDINAL_SUFFIX_DAY_EN_GB
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.ShortDateWithYearAndOrdinalSuffixDay',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.ShortDateWithYearAndOrdinalSuffixDay,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_GB
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_US
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_US
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_DAY_OF_WEEK_AND_YEAR_EN_GB
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.ShortDateWithDayOfWeekAndYear',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.ShortDateWithDayOfWeekAndYear,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.LONG_DATE_EN_GB],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.LONG_DATE_EN_US],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.LONG_DATE_EN_US],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.LONG_DATE_EN_GB],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.LongDate',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.LongDate,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_EN_GB
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_EN_US
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_EN_US
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_EN_GB
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.LongDateWithDayOfWeek',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.LongDateWithDayOfWeek,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_GB],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_US],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.LONG_DATE_WITH_YEAR_EN_GB],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.LongDateWithYear',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.LongDateWithYear,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.LONG_DATE_WITH_YEAR_AND_TIME_EN_GB_24_HOUR
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.LONG_DATE_WITH_YEAR_AND_TIME_EN_US_AM_PM
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.LONG_DATE_WITH_YEAR_AND_TIME_EN_US_24_HOUR
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.LONG_DATE_WITH_YEAR_AND_TIME_EN_GB_AM_PM
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.LongDateWithYearAndTime',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.LongDateWithYearAndTime,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_SHORT],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_SHORT],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_SHORT],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_SHORT],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.MonthAndYearShort',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.MonthAndYearShort,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_LONG],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_LONG],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_LONG],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[DateTimeFormatType.MONTH_AND_YEAR_LONG],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.MonthAndYearLong',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.MonthAndYearLong,
                ),
            ).toEqual(expectedFormat)
        },
    )

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_GB_24_HOUR
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_US_AM_PM
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_US_24_HOUR
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.RELATIVE_DATE_AND_TIME_EN_GB_AM_PM
            ],
        ],
    ])(
        'should test DateAndTimeFormattingSettingType.RelativeDateAndTime',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.RelativeDateAndTime,
                ),
            ).toEqual(expectedFormat)
        },
    )
})

describe('hoursToSeconds', () => {
    it('should return zero for undefined', () => {
        expect(hoursToSeconds()).toBe(0)
    })

    it('should return zero for non-numbers', () => {
        expect(hoursToSeconds('1')).toBe(0)
    })

    it('should convert hours to seconds', () => {
        expect(hoursToSeconds(2)).toBe(2 * 60 * 60)
    })
})

describe('daysToHours', () => {
    it('should convert days to hours', () => {
        expect(daysToHours(2)).toBe(48)
    })

    it('should return zero for default value', () => {
        expect(daysToHours()).toBe(0)
    })

    it('should return zero for non-numbers', () => {
        expect(daysToHours('5' as unknown as number)).toBe(0)
    })

    it('should return zero for zero input', () => {
        expect(daysToHours(0)).toBe(0)
    })

    it('should handle negative values', () => {
        expect(daysToHours(-2)).toBe(-48)
    })

    it('should handle decimal values', () => {
        expect(daysToHours(0.5)).toBe(12)
    })
})

describe('hoursToSeconds - additional edge cases', () => {
    it('should return zero for zero input', () => {
        expect(hoursToSeconds(0)).toBe(0)
    })

    it('should handle negative values', () => {
        expect(hoursToSeconds(-2)).toBe(-7200)
    })

    it('should handle decimal values', () => {
        expect(hoursToSeconds(0.5)).toBe(1800)
    })
})

describe('formatDatetime', () => {
    const simpleFormat = 'YYYY-MM-DD HH:mm:ss'
    const timeOnlyFormat = 'HH:mm'

    describe('with Moment objects', () => {
        it('should format a Moment object preserving its timezone', () => {
            const momentDate = moment.utc('2024-03-15T10:30:00Z')
            const result = formatDatetime(momentDate, simpleFormat)
            expect(result).toBe('2024-03-15 10:30:00')
        })

        it('should format a Moment object with time only format', () => {
            const momentDate = moment.utc('2024-03-15T14:45:30Z')
            const result = formatDatetime(momentDate, timeOnlyFormat)
            expect(result).toBe('14:45')
        })
    })

    describe('with UNIX timestamps', () => {
        it('should format a UNIX timestamp (seconds) in local time', () => {
            const timestamp = 1710498600
            const result = formatDatetime(timestamp, simpleFormat)
            const expected = moment.unix(timestamp).format(simpleFormat)
            expect(result).toBe(expected)
        })
    })

    describe('with ISO strings', () => {
        it('should format an ISO string and return valid date format', () => {
            const isoString = '2024-03-15T10:30:00Z'
            const result = formatDatetime(isoString, simpleFormat)
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
            expect(result).toContain('2024-03-15')
        })
    })

    describe('with timezone', () => {
        it('should apply timezone to Moment object', () => {
            const momentDate = moment.utc('2024-03-15T10:30:00Z')
            const result = formatDatetime(
                momentDate,
                timeOnlyFormat,
                'America/New_York',
            )
            expect(result).toBe('06:30')
        })

        it('should not apply timezone when null', () => {
            const momentDate = moment.utc('2024-03-15T10:30:00Z')
            const result = formatDatetime(momentDate, timeOnlyFormat, null)
            expect(result).toBe('10:30')
        })
    })

    describe('with calendar format (object)', () => {
        it('should use calendar format for relative dates', () => {
            const today = moment.utc().startOf('day').add(14, 'hours')
            const calendarFormat = {
                sameDay: '[Today at] H:mm',
                nextDay: '[Tomorrow at] H:mm',
                lastDay: '[Yesterday at] H:mm',
                nextWeek: 'dddd [at] H:mm',
                lastWeek: 'dddd',
                sameElse: 'DD/MM/YYYY',
            }
            const result = formatDatetime(today, calendarFormat)
            expect(result).toBe('Today at 14:00')
        })

        it('should format yesterday with calendar format', () => {
            const yesterday = moment
                .utc()
                .subtract(1, 'day')
                .startOf('day')
                .add(9, 'hours')
            const calendarFormat = {
                sameDay: '[Today at] H:mm',
                nextDay: '[Tomorrow at] H:mm',
                lastDay: '[Yesterday at] H:mm',
                nextWeek: 'dddd [at] H:mm',
                lastWeek: 'dddd',
                sameElse: 'DD/MM/YYYY',
            }
            const result = formatDatetime(yesterday, calendarFormat)
            expect(result).toBe('Yesterday at 9:00')
        })
    })

    describe('error handling', () => {
        it('should handle empty object by returning formatted current date', () => {
            const invalidInput = {} as unknown as Date
            const result = formatDatetime(invalidInput, simpleFormat)
            expect(typeof result).toBe('string')
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
        })
    })
})

describe('getLocalTime', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-03-15T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return formatted time for positive timezone offset', () => {
        const result = getLocalTime('+05:00', 'HH:mm')
        expect(result).toBe('17:00')
    })

    it('should return formatted time for negative timezone offset', () => {
        const result = getLocalTime('-05:00', 'HH:mm')
        expect(result).toBe('07:00')
    })

    it('should return formatted time for zero timezone offset', () => {
        const result = getLocalTime('+00:00', 'HH:mm')
        expect(result).toBe('12:00')
    })

    it('should work with different format strings', () => {
        const result = getLocalTime('+02:00', 'h:mm A')
        expect(result).toBe('2:00 PM')
    })
})

describe('getDateAndTimeFormat - ShortMonthDayWithTime', () => {
    const timeSetting24hour = TimeFormatType.TwentyFourHour
    const timeSettingAMPM = TimeFormatType.AmPm
    const dateSettingEnGB = DateFormatType.en_GB
    const dateSettingEnUS = DateFormatType.en_US

    it.each([
        [
            timeSetting24hour,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_GB
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_US
            ],
        ],
        [
            timeSetting24hour,
            dateSettingEnUS,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_US
            ],
        ],
        [
            timeSettingAMPM,
            dateSettingEnGB,
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_GB
            ],
        ],
    ])(
        'should test DateAndTimeFormatting.ShortMonthDayWithTime',
        (timeSetting, dateSetting, expectedFormat) => {
            expect(
                getDateAndTimeFormat(
                    dateSetting,
                    timeSetting,
                    DateAndTimeFormatting.ShortMonthDayWithTime,
                ),
            ).toEqual(expectedFormat)
        },
    )
})
