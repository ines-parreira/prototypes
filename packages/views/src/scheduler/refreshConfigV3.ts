export type RefreshConfigV3 = {
    /** How often the scheduler runs in the leader tab. */
    tickIntervalSeconds: number

    /**
     * Maximum number of views tracked as "recent" — the LRU set the scheduler
     * polls. Older entries fall out as newer ones are activated. Matches the
     * pre-scheduler `MAX_RECENT_VIEWS = 8`.
     */
    maxRecentViews: number

    /**
     * Step table mapping a count threshold (key) to the TTL in seconds (value).
     * A view's TTL is the value at the largest key ≤ its count. Keys are
     * stringified integers (JSON keys are always strings); lookup parses
     * them.
     *
     * Example: `{ 0: 30, 100: 60, 500: 300, 1000: 600 }` →
     * 50 tickets → 30 s, 250 → 60 s, 700 → 300 s, 1500 → 600 s.
     */
    ttlSecondsByCount: Record<number, number>

    /**
     * Minimum gap between successive bulk `all: true` initial fetches. The
     * scheduler considers firing this only on leader takeover (new tab,
     * steal); it doesn't run on a timer. A persisted `lastFetchAllAt`
     * stamp younger than this is treated as "still fresh" and the new
     * leader skips the bulk fetch.
     */
    fetchAllMinCooldownSeconds: number
}

/**
 * Mirrors the pre-scheduler Redux polling cadence shape — small views refresh
 * aggressively, large ones less so. Coarser than the old `ceil(count/100)*60`
 * function but tunable via the `ViewCountSchedulerV3Config` flag.
 */
export const DEFAULT_REFRESH_CONFIG_V3: RefreshConfigV3 = {
    tickIntervalSeconds: 5,
    maxRecentViews: 8,
    ttlSecondsByCount: {
        0: 30,
        100: 60,
        500: 300,
        1000: 600,
    },
    fetchAllMinCooldownSeconds: 3600, // 1 hour
}

/**
 * Resolves the per-view TTL by walking `ttlSecondsByCount`: returns the value
 * at the largest threshold ≤ count. Falls back to the lowest entry (or 30 s)
 * if no threshold matches — typically only when the count is negative or the
 * table has no `0` entry.
 */
export function getTtlSecondsForCount(
    count: number | undefined,
    config: RefreshConfigV3 = DEFAULT_REFRESH_CONFIG_V3,
): number {
    const sorted = Object.entries(config.ttlSecondsByCount)
        .map(([key, value]) => [Number(key), value] as const)
        .sort((a, b) => a[0] - b[0])
    if (sorted.length === 0) return 30

    const c = count ?? 0
    let ttl = sorted[0][1]
    for (const [threshold, value] of sorted) {
        if (c >= threshold) ttl = value
        else break
    }
    return ttl
}
