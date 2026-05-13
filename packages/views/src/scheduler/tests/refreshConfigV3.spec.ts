import type { RefreshConfigV3 } from '../refreshConfigV3'
import {
    DEFAULT_REFRESH_CONFIG_V3,
    getTtlSecondsForCount,
} from '../refreshConfigV3'

describe('getTtlSecondsForCount (default config)', () => {
    it('returns the entry for the largest threshold ≤ count', () => {
        // Default table: { 0: 30, 100: 60, 500: 300, 1000: 600 }
        expect(getTtlSecondsForCount(0)).toBe(30)
        expect(getTtlSecondsForCount(50)).toBe(30)
        expect(getTtlSecondsForCount(99)).toBe(30)
        expect(getTtlSecondsForCount(100)).toBe(60)
        expect(getTtlSecondsForCount(250)).toBe(60)
        expect(getTtlSecondsForCount(499)).toBe(60)
        expect(getTtlSecondsForCount(500)).toBe(300)
        expect(getTtlSecondsForCount(999)).toBe(300)
        expect(getTtlSecondsForCount(1000)).toBe(600)
        expect(getTtlSecondsForCount(50_000)).toBe(600)
    })

    it('treats undefined as 0', () => {
        expect(getTtlSecondsForCount(undefined)).toBe(30)
    })
})

describe('getTtlSecondsForCount (custom config)', () => {
    it('honors a fully custom step table', () => {
        const config: RefreshConfigV3 = {
            ...DEFAULT_REFRESH_CONFIG_V3,
            ttlSecondsByCount: {
                0: 10,
                10: 20,
                100: 200,
            },
        }

        expect(getTtlSecondsForCount(5, config)).toBe(10)
        expect(getTtlSecondsForCount(10, config)).toBe(20)
        expect(getTtlSecondsForCount(50, config)).toBe(20)
        expect(getTtlSecondsForCount(100, config)).toBe(200)
        expect(getTtlSecondsForCount(9999, config)).toBe(200)
    })

    it('falls back to 30 s when the table is empty', () => {
        const config: RefreshConfigV3 = {
            ...DEFAULT_REFRESH_CONFIG_V3,
            ttlSecondsByCount: {},
        }

        expect(getTtlSecondsForCount(100, config)).toBe(30)
    })

    it('uses the smallest entry as the floor when count is below it', () => {
        // No `0` entry: 50 falls below the smallest threshold.
        const config: RefreshConfigV3 = {
            ...DEFAULT_REFRESH_CONFIG_V3,
            ttlSecondsByCount: {
                100: 45,
                500: 300,
            },
        }

        expect(getTtlSecondsForCount(50, config)).toBe(45)
        expect(getTtlSecondsForCount(100, config)).toBe(45)
        expect(getTtlSecondsForCount(700, config)).toBe(300)
    })
})
