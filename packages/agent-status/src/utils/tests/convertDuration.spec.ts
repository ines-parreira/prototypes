import { describe, expect, it } from 'vitest'

import { convertDurationToSeconds } from '../convertDuration'

describe('convertDurationToSeconds', () => {
    describe('minutes conversion', () => {
        it('should convert 15 minutes to seconds', () => {
            expect(convertDurationToSeconds('minutes', 15)).toBe(900)
        })

        it('should convert 30 minutes to seconds', () => {
            expect(convertDurationToSeconds('minutes', 30)).toBe(1800)
        })

        it('should convert 1 minute to seconds', () => {
            expect(convertDurationToSeconds('minutes', 1)).toBe(60)
        })
    })

    describe('hours conversion', () => {
        it('should convert 1 hour to seconds', () => {
            expect(convertDurationToSeconds('hours', 1)).toBe(3600)
        })

        it('should convert 4 hours to seconds', () => {
            expect(convertDurationToSeconds('hours', 4)).toBe(14400)
        })

        it('should convert 24 hours to seconds', () => {
            expect(convertDurationToSeconds('hours', 24)).toBe(86400)
        })
    })

    describe('days conversion', () => {
        it('should convert 1 day to seconds', () => {
            expect(convertDurationToSeconds('days', 1)).toBe(86400)
        })

        it('should convert 7 days to seconds', () => {
            expect(convertDurationToSeconds('days', 7)).toBe(604800)
        })

        it('should convert 30 days to seconds', () => {
            expect(convertDurationToSeconds('days', 30)).toBe(2592000)
        })
    })

    describe('null and undefined handling', () => {
        it('should return null when duration_unit is null', () => {
            expect(convertDurationToSeconds(null, 30)).toBe(null)
        })

        it('should return null when duration_value is null', () => {
            expect(convertDurationToSeconds('minutes', null)).toBe(null)
        })

        it('should return null when both are null', () => {
            expect(convertDurationToSeconds(null, null)).toBe(null)
        })
    })

    describe('edge cases', () => {
        it('should handle 0 minutes', () => {
            expect(convertDurationToSeconds('minutes', 0)).toBe(0)
        })

        it('should handle large values', () => {
            expect(convertDurationToSeconds('days', 365)).toBe(31536000)
        })

        it('should handle fractional values (if passed)', () => {
            expect(convertDurationToSeconds('hours', 1.5)).toBe(5400)
        })
    })
})
