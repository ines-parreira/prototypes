import { parseRefreshConfigV3 } from '../refreshConfigSchemaV3'
import { DEFAULT_REFRESH_CONFIG_V3 } from '../refreshConfigV3'

describe('parseRefreshConfigV3', () => {
    it('returns defaults when value is null or undefined', () => {
        expect(parseRefreshConfigV3(null)).toEqual(DEFAULT_REFRESH_CONFIG_V3)
        expect(parseRefreshConfigV3(undefined)).toEqual(
            DEFAULT_REFRESH_CONFIG_V3,
        )
    })

    it('returns defaults when value is not an object', () => {
        expect(parseRefreshConfigV3('nope')).toEqual(DEFAULT_REFRESH_CONFIG_V3)
        expect(parseRefreshConfigV3(7)).toEqual(DEFAULT_REFRESH_CONFIG_V3)
        expect(parseRefreshConfigV3([])).toEqual(DEFAULT_REFRESH_CONFIG_V3)
    })

    it('returns defaults when a scalar field has an invalid value', () => {
        expect(parseRefreshConfigV3({ tickIntervalSeconds: 0 })).toEqual(
            DEFAULT_REFRESH_CONFIG_V3,
        )
        expect(parseRefreshConfigV3({ maxRecentViews: 2.5 })).toEqual(
            DEFAULT_REFRESH_CONFIG_V3,
        )
    })

    it('rejects ttlSecondsByCount keys that are not integers', () => {
        expect(
            parseRefreshConfigV3({ ttlSecondsByCount: { foo: 30 } }),
        ).toEqual(DEFAULT_REFRESH_CONFIG_V3)
        expect(
            parseRefreshConfigV3({ ttlSecondsByCount: { '1.5': 30 } }),
        ).toEqual(DEFAULT_REFRESH_CONFIG_V3)
    })

    it('rejects non-positive ttlSecondsByCount values', () => {
        expect(parseRefreshConfigV3({ ttlSecondsByCount: { 100: 0 } })).toEqual(
            DEFAULT_REFRESH_CONFIG_V3,
        )
        expect(
            parseRefreshConfigV3({ ttlSecondsByCount: { 100: -10 } }),
        ).toEqual(DEFAULT_REFRESH_CONFIG_V3)
    })

    it('accepts fetchAllMinCooldownSeconds (zero allowed)', () => {
        expect(parseRefreshConfigV3({ fetchAllMinCooldownSeconds: 0 })).toEqual(
            {
                ...DEFAULT_REFRESH_CONFIG_V3,
                fetchAllMinCooldownSeconds: 0,
            },
        )
        expect(
            parseRefreshConfigV3({ fetchAllMinCooldownSeconds: 3600 }),
        ).toEqual({
            ...DEFAULT_REFRESH_CONFIG_V3,
            fetchAllMinCooldownSeconds: 3600,
        })
    })

    it('rejects a negative fetchAllMinCooldownSeconds', () => {
        expect(
            parseRefreshConfigV3({ fetchAllMinCooldownSeconds: -1 }),
        ).toEqual(DEFAULT_REFRESH_CONFIG_V3)
    })

    it('merges a valid partial override onto the defaults', () => {
        const result = parseRefreshConfigV3({ tickIntervalSeconds: 10 })

        expect(result).toEqual({
            ...DEFAULT_REFRESH_CONFIG_V3,
            tickIntervalSeconds: 10,
        })
    })

    it('replaces ttlSecondsByCount with the provided table (no per-key merge)', () => {
        const result = parseRefreshConfigV3({
            ttlSecondsByCount: { 0: 5, 50: 25 },
        })

        expect(result.ttlSecondsByCount).toEqual({ 0: 5, 50: 25 })
    })

    it('ignores unknown top-level keys', () => {
        const result = parseRefreshConfigV3({
            tickIntervalSeconds: 10,
            unrelated: 'whatever',
        })

        expect(result).toEqual({
            ...DEFAULT_REFRESH_CONFIG_V3,
            tickIntervalSeconds: 10,
        })
    })
})
