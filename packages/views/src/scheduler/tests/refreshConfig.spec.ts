import type { RefreshConfig } from '../refreshConfig'
import {
    DEFAULT_REFRESH_CONFIG,
    getTtlSecondsForCount,
    getTtlSecondsForView,
} from '../refreshConfig'

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
        const config: RefreshConfig = {
            ...DEFAULT_REFRESH_CONFIG,
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
        const config: RefreshConfig = {
            ...DEFAULT_REFRESH_CONFIG,
            ttlSecondsByCount: {},
        }

        expect(getTtlSecondsForCount(100, config)).toBe(30)
    })

    it('uses the smallest entry as the floor when count is below it', () => {
        // No `0` entry: 50 falls below the smallest threshold.
        const config: RefreshConfig = {
            ...DEFAULT_REFRESH_CONFIG,
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

describe('getTtlSecondsForView', () => {
    it('uses the default active view TTL for active views', () => {
        expect(
            getTtlSecondsForView({
                count: 1000,
                isActiveView: true,
            }),
        ).toBe(30)
    })

    it('uses the count-based TTL when the active view override is explicitly disabled', () => {
        const config: RefreshConfig = {
            ...DEFAULT_REFRESH_CONFIG,
            activeViewTtlSeconds: null,
        }

        expect(
            getTtlSecondsForView({
                count: 1000,
                isActiveView: true,
                config,
            }),
        ).toBe(600)
    })

    it('uses activeViewTtlSeconds only for the active view', () => {
        const config: RefreshConfig = {
            ...DEFAULT_REFRESH_CONFIG,
            activeViewTtlSeconds: 0,
        }

        expect(
            getTtlSecondsForView({
                count: 50,
                isActiveView: true,
                config,
            }),
        ).toBe(0)
        expect(
            getTtlSecondsForView({
                count: 50,
                isActiveView: false,
                config,
            }),
        ).toBe(30)
    })
})
