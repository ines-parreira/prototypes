// bypassing mocked values in setup.js
import moment from 'moment'
import {
    DETAILED_FORMATTED_DATE_OPTIONS,
    getDetailedFormattedDate,
    getFormattedDate,
    getMomentTimezoneNames,
    subtractDaysFromDate,
} from '../date'

const {getMomentTimezoneNames: getMomentTimezoneNamesActual} =
    jest.requireActual('../date')

describe('date utils', () => {
    describe('getMomentTimezoneNames', () => {
        it('should return timezone names', () => {
            expect(
                (
                    getMomentTimezoneNamesActual as typeof getMomentTimezoneNames
                )()
            ).toMatchSnapshot()
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
                'Invalid date'
            )
        })
    })

    describe('subtractDaysFromDate', () => {
        it('should return a correct date by subtracting x days ', () => {
            const date = '2022-12-16T00:00:00Z'
            const expectedResult = moment
                .parseZone('2022-12-11T00:00:00Z')
                .utcOffset(0, true)

            const result = subtractDaysFromDate(date, 5)

            expect(result.toISOString()).toEqual(expectedResult.toISOString())
        })

        it('should return the same date when subtracting 0 days', () => {
            const date = '2022-12-16T00:00:00Z'
            const expectedResult = moment
                .parseZone('2022-12-16T00:00:00Z')
                .utcOffset(0, true)

            const result = subtractDaysFromDate(date, 0)

            expect(result).toEqual(expectedResult)
        })
    })

    describe('getDetailedFormattedDate', () => {
        it('should return a detailed formatted date string in the default locale (en-US)', () => {
            const date = '2022-12-16T00:00:00Z'
            const expectedResult = new Intl.DateTimeFormat(
                'en-US',
                DETAILED_FORMATTED_DATE_OPTIONS
            ).format(new Date(date))

            const result = getDetailedFormattedDate(date)

            expect(result).toEqual(expectedResult)
        })

        it('should return a detailed formatted date string in the specified locale', () => {
            const date = '2022-12-16T00:00:00Z'
            const locale = 'de-DE'
            const expectedResult = new Intl.DateTimeFormat(
                locale,
                DETAILED_FORMATTED_DATE_OPTIONS
            ).format(new Date(date))

            const result = getDetailedFormattedDate(date, locale)

            expect(result).toEqual(expectedResult)
        })

        it('should throw an error if the date is invalid', () => {
            const invalidDate = 'invalid date'
            expect(() => getFormattedDate(invalidDate)).toThrowError(
                'Invalid date'
            )
        })
    })
})
