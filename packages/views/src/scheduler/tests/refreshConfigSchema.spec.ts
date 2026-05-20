import { DEFAULT_REFRESH_CONFIG } from '../refreshConfig'
import { parseRefreshConfig } from '../refreshConfigSchema'

describe('parseRefreshConfig', () => {
    it('returns defaults when value is null or undefined', () => {
        expect(parseRefreshConfig(null)).toEqual(DEFAULT_REFRESH_CONFIG)
        expect(parseRefreshConfig(undefined)).toEqual(DEFAULT_REFRESH_CONFIG)
    })

    it('returns defaults when value is not an object', () => {
        expect(parseRefreshConfig('nope')).toEqual(DEFAULT_REFRESH_CONFIG)
        expect(parseRefreshConfig(7)).toEqual(DEFAULT_REFRESH_CONFIG)
        expect(parseRefreshConfig([])).toEqual(DEFAULT_REFRESH_CONFIG)
    })

    it('returns defaults when a scalar field has an invalid value', () => {
        expect(parseRefreshConfig({ tickIntervalSeconds: 0 })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
        expect(parseRefreshConfig({ maxRecentViews: 2.5 })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
    })

    it('rejects ttlSecondsByCount keys that are not integers', () => {
        expect(parseRefreshConfig({ ttlSecondsByCount: { foo: 30 } })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
        expect(
            parseRefreshConfig({ ttlSecondsByCount: { '1.5': 30 } }),
        ).toEqual(DEFAULT_REFRESH_CONFIG)
    })

    it('rejects non-positive ttlSecondsByCount values', () => {
        expect(parseRefreshConfig({ ttlSecondsByCount: { 100: 0 } })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
        expect(parseRefreshConfig({ ttlSecondsByCount: { 100: -10 } })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
    })

    it('merges a valid partial override onto the defaults', () => {
        const result = parseRefreshConfig({ tickIntervalSeconds: 10 })

        expect(result).toEqual({
            ...DEFAULT_REFRESH_CONFIG,
            tickIntervalSeconds: 10,
        })
    })

    it('defaults the active view TTL to 30 seconds when omitted', () => {
        expect(parseRefreshConfig({ tickIntervalSeconds: 10 })).toMatchObject({
            activeViewTtlSeconds: 30,
        })
    })

    it('accepts zero as an active view TTL override', () => {
        const result = parseRefreshConfig({ activeViewTtlSeconds: 0 })

        expect(result).toEqual({
            ...DEFAULT_REFRESH_CONFIG,
            activeViewTtlSeconds: 0,
        })
    })

    it('rejects negative active view TTL overrides', () => {
        expect(parseRefreshConfig({ activeViewTtlSeconds: -1 })).toEqual(
            DEFAULT_REFRESH_CONFIG,
        )
    })

    it('allows null to explicitly use the count-based TTL for active views', () => {
        const result = parseRefreshConfig({ activeViewTtlSeconds: null })

        expect(result).toEqual({
            ...DEFAULT_REFRESH_CONFIG,
            activeViewTtlSeconds: null,
        })
    })

    it('replaces ttlSecondsByCount with the provided table (no per-key merge)', () => {
        const result = parseRefreshConfig({
            ttlSecondsByCount: { 0: 5, 50: 25 },
        })

        expect(result.ttlSecondsByCount).toEqual({ 0: 5, 50: 25 })
    })

    it('ignores unknown top-level keys', () => {
        const result = parseRefreshConfig({
            tickIntervalSeconds: 10,
            unrelated: 'whatever',
        })

        expect(result).toEqual({
            ...DEFAULT_REFRESH_CONFIG,
            tickIntervalSeconds: 10,
        })
    })
})
