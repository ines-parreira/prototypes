import { parseAbsolute } from '@internationalized/date'
import moment from 'moment-timezone'

import {
    createRangeValueFromMoments,
    extractMomentsFromRange,
    getKnowledgeHubDatePresets,
    momentToZonedDateTime,
    zonedDateTimeToMoment,
} from '../dateConversion'

describe('dateConversion utilities', () => {
    describe('momentToZonedDateTime', () => {
        it('converts Moment to ZonedDateTime', () => {
            const m = moment('2025-01-15T10:30:00Z')
            const zdt = momentToZonedDateTime(m)

            expect(zdt).not.toBeNull()
            expect(zdt!.year).toBe(2025)
            expect(zdt!.month).toBe(1)
            expect(zdt!.day).toBe(15)
        })

        it('handles null', () => {
            expect(momentToZonedDateTime(null)).toBeNull()
        })

        it('preserves timezone as UTC', () => {
            const m = moment('2025-01-15T10:30:00Z')
            const zdt = momentToZonedDateTime(m)

            expect(zdt!.timeZone).toBe('UTC')
        })
    })

    describe('zonedDateTimeToMoment', () => {
        it('converts ZonedDateTime to Moment', () => {
            const isoString = '2025-01-15T10:30:00Z'
            const zdt = parseAbsolute(isoString, 'UTC')
            const m = zonedDateTimeToMoment(zdt)

            expect(m).not.toBeNull()
            expect(m!.year()).toBe(2025)
            expect(m!.month()).toBe(0)
            expect(m!.date()).toBe(15)
        })

        it('handles null', () => {
            expect(zonedDateTimeToMoment(null)).toBeNull()
        })
    })

    describe('round-trip conversion', () => {
        it('preserves date values through Moment -> ZonedDateTime -> Moment', () => {
            const original = moment('2025-01-15T10:30:00Z')
            const zdt = momentToZonedDateTime(original)
            const converted = zonedDateTimeToMoment(zdt)

            expect(converted!.isSame(original, 'day')).toBe(true)
            expect(converted!.year()).toBe(original.year())
            expect(converted!.month()).toBe(original.month())
            expect(converted!.date()).toBe(original.date())
        })

        it('preserves date values through ZonedDateTime -> Moment -> ZonedDateTime', () => {
            const original = parseAbsolute('2025-01-15T10:30:00Z', 'UTC')
            const m = zonedDateTimeToMoment(original)
            const converted = momentToZonedDateTime(m)

            expect(converted!.year).toBe(original.year)
            expect(converted!.month).toBe(original.month)
            expect(converted!.day).toBe(original.day)
        })
    })

    describe('createRangeValueFromMoments', () => {
        it('creates RangeValue from two Moment objects', () => {
            const start = moment('2025-01-01T00:00:00Z')
            const end = moment('2025-01-31T23:59:59Z')

            const range = createRangeValueFromMoments(start, end)

            expect(range).not.toBeNull()
            expect(range!.start.year).toBe(2025)
            expect(range!.start.month).toBe(1)
            expect(range!.start.day).toBe(1)
            expect(range!.end.year).toBe(2025)
            expect(range!.end.month).toBe(1)
            expect(range!.end.day).toBe(31)
        })

        it('returns null if start is null', () => {
            const end = moment('2025-01-31T23:59:59Z')
            const range = createRangeValueFromMoments(null, end)

            expect(range).toBeNull()
        })

        it('returns null if end is null', () => {
            const start = moment('2025-01-01T00:00:00Z')
            const range = createRangeValueFromMoments(start, null)

            expect(range).toBeNull()
        })

        it('returns null if both are null', () => {
            const range = createRangeValueFromMoments(null, null)

            expect(range).toBeNull()
        })
    })

    describe('extractMomentsFromRange', () => {
        it('extracts Moment objects from RangeValue', () => {
            const startZdt = parseAbsolute('2025-01-01T00:00:00Z', 'UTC')
            const endZdt = parseAbsolute('2025-01-31T23:59:59Z', 'UTC')
            const range = { start: startZdt, end: endZdt }

            const { start, end } = extractMomentsFromRange(range)

            expect(start).not.toBeNull()
            expect(end).not.toBeNull()
            expect(start!.year()).toBe(2025)
            expect(start!.month()).toBe(0)
            expect(start!.date()).toBe(1)
            expect(end!.year()).toBe(2025)
            expect(end!.month()).toBe(0)
            expect(end!.date()).toBe(31)
        })

        it('returns null values if range is null', () => {
            const { start, end } = extractMomentsFromRange(null)

            expect(start).toBeNull()
            expect(end).toBeNull()
        })
    })

    describe('getKnowledgeHubDatePresets', () => {
        it('returns array of date presets', () => {
            const presets = getKnowledgeHubDatePresets()

            expect(presets).toHaveLength(5)
            expect(presets[0]).toEqual({
                id: 'today',
                label: 'Today',
                duration: { days: 0 },
            })
            expect(presets[1]).toEqual({
                id: 'last-7-days',
                label: 'Last 7 days',
                duration: { days: -7 },
            })
            expect(presets[2]).toEqual({
                id: 'last-30-days',
                label: 'Last 30 days',
                duration: { days: -30 },
            })
            expect(presets[3]).toEqual({
                id: 'last-60-days',
                label: 'Last 60 days',
                duration: { days: -60 },
            })
            expect(presets[4]).toEqual({
                id: 'last-90-days',
                label: 'Last 90 days',
                duration: { days: -90 },
            })
        })
    })

    describe('edge cases', () => {
        it('handles leap year dates', () => {
            const m = moment('2024-02-29T12:00:00Z')
            const zdt = momentToZonedDateTime(m)
            const converted = zonedDateTimeToMoment(zdt)

            expect(converted!.year()).toBe(2024)
            expect(converted!.month()).toBe(1)
            expect(converted!.date()).toBe(29)
        })

        it('handles year boundary', () => {
            const m = moment('2024-12-31T23:59:59Z')
            const zdt = momentToZonedDateTime(m)
            const converted = zonedDateTimeToMoment(zdt)

            expect(converted!.year()).toBe(2024)
            expect(converted!.month()).toBe(11)
            expect(converted!.date()).toBe(31)
        })
    })
})
