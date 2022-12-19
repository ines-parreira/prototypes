// bypassing mocked values in setup.js
import {
    getDetailedFormattedDate,
    getFormattedDate,
    getMomentTimezoneNames,
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

    describe('getDetailedFormattedDate', () => {
        it('should return a detailed formatted date string in the default locale (en-US)', () => {
            const date = '2022-12-16T00:00:00Z'
            const expectedResult = 'December 16, 2022, 12:00 AM'

            const result = getDetailedFormattedDate(date)

            expect(result).toEqual(expectedResult)
        })

        it('should return a detailed formatted date string in the specified locale', () => {
            const date = '2022-12-16T00:00:00Z'
            const locale = 'de-DE'
            const expectedResult = '16. Dezember 2022, 00:00'

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
