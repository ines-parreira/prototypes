import { describe, expect, it } from 'vitest'

import { formatDuration } from '../formatDuration'

describe('formatDuration', () => {
    describe('null and undefined values', () => {
        it('should return "Unlimited" when both unit and value are null', () => {
            expect(formatDuration(null, null)).toBe('Unlimited')
        })

        it('should return "Unlimited" when unit is null', () => {
            expect(formatDuration(null, 30)).toBe('Unlimited')
        })

        it('should return "Unlimited" when value is null', () => {
            expect(formatDuration('minutes', null)).toBe('Unlimited')
        })
    })

    describe('minutes', () => {
        it('should format 15 minutes', () => {
            expect(formatDuration('minutes', 15)).toBe('15 minutes')
        })

        it('should format 30 minutes', () => {
            expect(formatDuration('minutes', 30)).toBe('30 minutes')
        })

        it('should format 1 minute (singular)', () => {
            expect(formatDuration('minutes', 1)).toBe('1 minute')
        })

        it('should format 59 minutes', () => {
            expect(formatDuration('minutes', 59)).toBe('59 minutes')
        })

        it('should format 0 minutes', () => {
            expect(formatDuration('minutes', 0)).toBe('0 minutes')
        })
    })

    describe('hours', () => {
        it('should format 1 hour (singular)', () => {
            expect(formatDuration('hours', 1)).toBe('1 hour')
        })

        it('should format 2 hours', () => {
            expect(formatDuration('hours', 2)).toBe('2 hours')
        })

        it('should format 4 hours', () => {
            expect(formatDuration('hours', 4)).toBe('4 hours')
        })

        it('should format 24 hours as 1 day', () => {
            expect(formatDuration('hours', 24)).toBe('1 day')
        })

        it('should handle fractional hours (e.g., 1.5 hours)', () => {
            expect(formatDuration('hours', 1.5)).toBe('1 hour 30 minutes')
        })
    })

    describe('days', () => {
        it('should format 1 day (singular)', () => {
            expect(formatDuration('days', 1)).toBe('1 day')
        })

        it('should format 2 days', () => {
            expect(formatDuration('days', 2)).toBe('2 days')
        })

        it('should format 7 days', () => {
            expect(formatDuration('days', 7)).toBe('7 days')
        })

        it('should format 30 days', () => {
            expect(formatDuration('days', 30)).toBe('30 days')
        })
    })

    describe('seconds', () => {
        it('should format 30 seconds', () => {
            expect(formatDuration('minutes', 0.5)).toBe('30 seconds')
        })

        it('should format 1 second (singular)', () => {
            expect(formatDuration('minutes', 1 / 60)).toBe('1 second')
        })
    })

    describe('years', () => {
        it('should format durations with years', () => {
            expect(formatDuration('days', 400)).toBe('1 year 1 month')
        })
    })

    describe('complex durations', () => {
        it('should show only the first 2 most significant units', () => {
            expect(formatDuration('minutes', 90)).toBe('1 hour 30 minutes')
        })

        it('should handle large values and convert to larger units', () => {
            expect(formatDuration('days', 365)).toBe('11 months 30 days')
        })

        it('should format smaller day values without conversion', () => {
            expect(formatDuration('days', 14)).toBe('14 days')
        })
    })
})
