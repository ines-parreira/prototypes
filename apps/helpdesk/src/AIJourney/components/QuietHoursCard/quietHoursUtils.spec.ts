import { Time } from '@internationalized/date'

import { formatHHMM, parseHHMM } from './quietHoursUtils'

describe('parseHHMM', () => {
    it('should parse "21:00" to Time(21, 0)', () => {
        const result = parseHHMM('21:00')
        expect(result).toEqual(new Time(21, 0))
    })

    it('should parse "08:30" to Time(8, 30)', () => {
        const result = parseHHMM('08:30')
        expect(result).toEqual(new Time(8, 30))
    })

    it('should return null for null input', () => {
        expect(parseHHMM(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
        expect(parseHHMM(undefined)).toBeNull()
    })

    it('should return null for empty string', () => {
        expect(parseHHMM('')).toBeNull()
    })

    it('should return null for invalid format', () => {
        expect(parseHHMM('not-a-time')).toBeNull()
    })
})

describe('formatHHMM', () => {
    it('should format Time(8, 0) to "08:00"', () => {
        expect(formatHHMM(new Time(8, 0))).toBe('08:00')
    })

    it('should format Time(21, 0) to "21:00"', () => {
        expect(formatHHMM(new Time(21, 0))).toBe('21:00')
    })

    it('should format Time(9, 5) to "09:05"', () => {
        expect(formatHHMM(new Time(9, 5))).toBe('09:05')
    })

    it('should return null for null input', () => {
        expect(formatHHMM(null)).toBeNull()
    })
})
