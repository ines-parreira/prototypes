import { convertToAmPm } from '../utils'

describe('utils', () => {
    describe('convertToAmPm', () => {
        it.each([
            ['00:00', '12:00 AM'],
            ['01:00', '1:00 AM'],
            ['12:00', '12:00 PM'],
            ['13:00', '1:00 PM'],
            ['23:00', '11:00 PM'],
            ['24:00', '12:00 AM'],
            ['22:15', '10:15 PM'],
            ['10:15', '10:15 AM'],
        ])('should convert %s to %s', (input, expected) => {
            expect(convertToAmPm(input)).toBe(expected)
        })
    })
})
