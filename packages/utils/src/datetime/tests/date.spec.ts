import moment from 'moment'
import type { MockInstance } from 'vitest'

import {
    DETAILED_FORMATTED_DATE_OPTIONS,
    getDetailedFormattedDate,
    getFormattedDate,
    getMomentTimezoneNames,
    shortenRelativeDurationLabel,
    subtractDaysFromDate,
} from '../date'

let dateNowSpy: MockInstance<typeof Date.now>
const defaultDateNowValue = 1707346800000 //  Feb 07 2024 23:00:00 GMT

describe('date utils', () => {
    beforeEach(() => {
        dateNowSpy = vi
            .spyOn(Date, 'now')
            .mockImplementation(() => defaultDateNowValue)
    })
    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    describe('getMomentTimezoneNames', () => {
        it('should return timezone names', async () => {
            const timezoneNames = getMomentTimezoneNames()

            expect(Array.isArray(timezoneNames)).toBe(true)
            expect(timezoneNames.length).toBeGreaterThan(0)
            expect(timezoneNames).toContain('UTC')
            expect(timezoneNames).toContain('America/New_York')
            expect(timezoneNames).toContain('Europe/London')
            expect(timezoneNames).toContain('Asia/Tokyo')
        })
    })

    describe('getFormattedDate', () => {
        it('should return a formatted date string in the default locale (en-US)', () => {
            const date = '2022-12-16T00:00:00Z'
            const expectedResult = '12/16/2022'

            const result = getFormattedDate(date)

            expect(result).toEqual(expectedResult)
        })

        it('should return a formatted date string in the specified locale', () => {
            const date = '2022-12-16T00:00:00Z'
            const locale = 'de-DE'
            const expectedResult = '16.12.2022'

            const result = getFormattedDate(date, locale)

            expect(result).toEqual(expectedResult)
        })

        it('should throw an error if the date is invalid', () => {
            const invalidDate = 'invalid date'
            expect(() => getFormattedDate(invalidDate)).toThrowError(
                'Invalid date',
            )
        })
    })

    describe('subtractDaysFromDate', () => {
        it('should return a correct date by subtracting x days ', () => {
            const date = '2022-12-16T00:00:00Z'
            const expectedResult = moment
                .parseZone('2022-12-11T00:00:00Z')
                .toISOString()

            const result = subtractDaysFromDate(date, 5)

            expect(result).toEqual(expectedResult)
        })

        it('should return the same date when subtracting 0 days', () => {
            const date = '2022-12-16T00:00:00Z'
            const expectedResult = moment
                .parseZone('2022-12-16T00:00:00Z')
                .toISOString()

            const result = subtractDaysFromDate(date, 0)

            expect(result).toEqual(expectedResult)
        })
    })

    describe('getDetailedFormattedDate', () => {
        it('should return a detailed formatted date string in the default locale (en-US)', () => {
            const date = '2022-12-16T00:00:00Z'
            const expectedResult = new Intl.DateTimeFormat(
                'en-US',
                DETAILED_FORMATTED_DATE_OPTIONS,
            ).format(new Date(date))

            const result = getDetailedFormattedDate(date)

            expect(result).toEqual(expectedResult)
        })

        it('should return a detailed formatted date string in the specified locale', () => {
            const date = '2022-12-16T00:00:00Z'
            const locale = 'de-DE'
            const expectedResult = new Intl.DateTimeFormat(
                locale,
                DETAILED_FORMATTED_DATE_OPTIONS,
            ).format(new Date(date))

            const result = getDetailedFormattedDate(date, locale)

            expect(result).toEqual(expectedResult)
        })

        it('should throw an error if the date is invalid', () => {
            const invalidDate = 'invalid date'
            expect(() => getFormattedDate(invalidDate)).toThrowError(
                'Invalid date',
            )
        })
    })

    describe('shortenRelativeDurationLabel', () => {
        it('should return abbreviated label for one unit', () => {
            const date = '2024-02-07T00:00:00Z'
            expect(
                shortenRelativeDurationLabel(moment(date).fromNow()),
            ).toEqual('1d')
        })

        it('should return abbreviated label for multiple unit', () => {
            const date = '2024-02-05T00:00:00Z'
            expect(
                shortenRelativeDurationLabel(moment(date).fromNow()),
            ).toEqual('3d')
        })

        it("should return 'now' for duration in seconds", () => {
            const date = '2024-02-07T23:00:10Z'
            expect(
                shortenRelativeDurationLabel(moment(date).fromNow()),
            ).toEqual('now')
        })

        it('should return the input when null', () => {
            expect(shortenRelativeDurationLabel(null)).toBeNull()
        })

        it('should handle duration in the future', () => {
            const date = '2024-02-07T23:59:10Z'

            expect(shortenRelativeDurationLabel(moment(date).fromNow())).toBe(
                'in 1h',
            )
        })
    })
})
