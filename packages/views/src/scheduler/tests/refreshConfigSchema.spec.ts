import { parseRefreshConfig } from '../refreshConfigSchema'
import { DEFAULT_REFRESH_CONFIG } from '../selectViewsToRefresh'

describe('parseRefreshConfig', () => {
    it('returns the defaults when the value is null or undefined', () => {
        expect(parseRefreshConfig(null)).toEqual(DEFAULT_REFRESH_CONFIG)
        expect(parseRefreshConfig(undefined)).toEqual(DEFAULT_REFRESH_CONFIG)
    })

    it('returns the defaults when the value is not an object', () => {
        expect(parseRefreshConfig('not an object')).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
        expect(parseRefreshConfig(42)).toEqual(DEFAULT_REFRESH_CONFIG)
        expect(parseRefreshConfig([])).toEqual(DEFAULT_REFRESH_CONFIG)
    })

    it('returns the defaults when any field has an invalid type', () => {
        expect(parseRefreshConfig({ tickIntervalSeconds: 'fast' })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
    })

    it('returns the defaults when any numeric field is not positive', () => {
        expect(parseRefreshConfig({ tickIntervalSeconds: 0 })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
        expect(parseRefreshConfig({ staleSeconds: -10 })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
    })

    it('returns the defaults when an integer field is fractional', () => {
        expect(parseRefreshConfig({ maxViewsPerTick: 2.5 })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
    })

    it('merges valid partial overrides onto the defaults', () => {
        expect(
            parseRefreshConfig({
                tickIntervalSeconds: 60,
                maxViewsPerTick: 10,
            }),
        ).toEqual({
            ...DEFAULT_REFRESH_CONFIG,
            tickIntervalSeconds: 60,
            maxViewsPerTick: 10,
        })
    })

    it('accepts a fully specified config', () => {
        const overrides = {
            tickIntervalSeconds: 60,
            minRefreshIntervalSeconds: 600,
            maxViewsPerTick: 10,
            maxRealtimePerTick: 4,
            initialMaxViews: 30,
            largeCountThreshold: 500,
            recentlyActiveWindowSeconds: 600,
            staleSeconds: 1200,
        }

        expect(parseRefreshConfig(overrides)).toEqual(overrides)
    })

    it('ignores unknown keys without breaking the merge', () => {
        expect(
            parseRefreshConfig({
                tickIntervalSeconds: 45,
                unrelated: 'whatever',
            }),
        ).toEqual({
            ...DEFAULT_REFRESH_CONFIG,
            tickIntervalSeconds: 45,
        })
    })
})
