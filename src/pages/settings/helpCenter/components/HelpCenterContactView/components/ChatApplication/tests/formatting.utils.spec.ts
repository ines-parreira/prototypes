import {
    getTimezoneAbbreviation,
    convertDaysToName,
    formatBusinessHoursByLocale,
} from '../formatting.utils'

jest.mock('moment', () => (date?: string, params?: string) => {
    const moment: (date: string, params?: string) => Record<string, unknown> =
        jest.requireActual('moment')

    return moment(date || '2019-09-03', params)
})

describe('getTimezoneAbbreviation', () => {
    it('returns the timezone abbreviation', () => {
        expect(getTimezoneAbbreviation('America/Los_Angeles')).toEqual('PDT')
        expect(getTimezoneAbbreviation('America/New_York')).toEqual('EDT')
        expect(getTimezoneAbbreviation('Asia/Tokyo')).toEqual('JST')
        expect(getTimezoneAbbreviation('Australia/Sydney')).toEqual('AEST')
    })
})

describe('convertDaysToName', () => {
    it('returns the day name', () => {
        expect(convertDaysToName('1')).toEqual('Monday')
    })

    it('returns the day name range', () => {
        expect(convertDaysToName('1,2')).toEqual('Monday - Tuesday')
        expect(convertDaysToName('1,2,3')).toEqual('Monday - Wednesday')
        expect(convertDaysToName('1,2,3,4')).toEqual('Monday - Thursday')
    })
})

describe('formatBusinessHoursByLocale', () => {
    it('should return the time in the correct format', () => {
        const formattedTime = formatBusinessHoursByLocale('13:00', 'en-US')
        expect(formattedTime).toEqual('01:00 PM')
    })

    it('should return the time in the correct format', () => {
        const formattedTime = formatBusinessHoursByLocale('13:00', 'fr-FR')
        expect(formattedTime).toEqual('13:00')
    })
})
