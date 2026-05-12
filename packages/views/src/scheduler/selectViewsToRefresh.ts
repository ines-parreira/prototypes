export type RefreshConfig = {
    /**
     * How often the scheduler runs in the leader tab. Each tick scores all
     * candidates and refreshes up to `maxViewsPerTick` of them. The active
     * view's eligibility cooldown is derived as `tickIntervalSeconds × 2`.
     */
    tickIntervalSeconds: number

    /**
     * Minimum time between successive refreshes of the same view (non-active).
     * Acts as a hard floor in `isEligible` — a candidate fetched more recently
     * than this is skipped entirely, regardless of its score.
     */
    minRefreshIntervalSeconds: number

    /**
     * Cap on how many views are refreshed per regular tick. Picked from the
     * top of the sorted score list. The initial tick uses `initialMaxViews`
     * instead so the user's viewport populates quickly on tab takeover.
     */
    maxViewsPerTick: number

    /**
     * Cap on how many realtime (chat) views can be included in a single tick's
     * `maxViewsPerTick` budget. Prevents chat polling from starving regular
     * views when several chat channels are visible at once.
     */
    maxRealtimePerTick: number

    /**
     * Budget used only on the first tick after a tab becomes leader.
     * Replaces `maxViewsPerTick` so the visible viewport (plus active/recent
     * fallbacks) populates in a single round trip instead of trickling in.
     */
    initialMaxViews: number

    /**
     * Count threshold above which a view is considered "large". Large views
     * get a ×0.25 score penalty when not stale to slow polling on heavy
     * inboxes; the penalty drops once they cross `staleSeconds`.
     */
    largeCountThreshold: number

    /**
     * Window after `lastViewedAt` during which a view stays in the `recent`
     * tier (+3000 score bonus). Lets just-left views keep refreshing
     * aggressively for a short period after the user navigates away.
     */
    recentlyActiveWindowSeconds: number

    /**
     * Age after which a view's count is considered stale. Drives the
     * `stale` flag used by several scoring modifiers (suppresses
     * large/low-priority/rest penalties so stale data gets caught up) and
     * the staleness cap of `staleSeconds × 2` for never-fetched views.
     */
    staleSeconds: number
}

export const DEFAULT_REFRESH_CONFIG: RefreshConfig = {
    tickIntervalSeconds: 30,
    minRefreshIntervalSeconds: 120,
    maxViewsPerTick: 5,
    maxRealtimePerTick: 2,
    initialMaxViews: 20,
    largeCountThreshold: 1000,
    recentlyActiveWindowSeconds: 300,
    staleSeconds: 600,
}

export type ViewRefreshCandidate = {
    viewId: number
    count: number
    lastFetchedAt: string | null
    lastViewedAt: string | null
    isRealtimeView: boolean
    isInViewport: boolean
    isSystemView: boolean
    isHighPriority: boolean
    isLowPriority: boolean
    isDeactivated: boolean
}

export function isEligible(
    candidate: ViewRefreshCandidate,
    config: RefreshConfig,
    now: number,
    activeViewIds: number[] = [],
): boolean {
    if (candidate.isDeactivated) return false
    const isActive = activeViewIds.includes(candidate.viewId)
    const cooldown = isActive
        ? config.tickIntervalSeconds * 2 * 1000
        : config.minRefreshIntervalSeconds * 1000

    if (!candidate.lastFetchedAt) return true
    const fetchedAge = now - new Date(candidate.lastFetchedAt).getTime()
    return fetchedAge >= cooldown
}

const STALENESS_CAP_MULTIPLIER = 2

function getStalenessSeconds(
    candidate: ViewRefreshCandidate,
    config: RefreshConfig,
    now: number,
): number {
    const cap = config.staleSeconds * STALENESS_CAP_MULTIPLIER
    if (!candidate.lastFetchedAt) return cap
    const elapsed = (now - new Date(candidate.lastFetchedAt).getTime()) / 1000
    return Math.min(elapsed, cap)
}

function isRecentlyViewed(
    candidate: ViewRefreshCandidate,
    config: RefreshConfig,
    now: number,
): boolean {
    if (!candidate.lastViewedAt) return false
    const viewedAge = (now - new Date(candidate.lastViewedAt).getTime()) / 1000
    return viewedAge <= config.recentlyActiveWindowSeconds
}

type Tier = 'active' | 'recent' | 'rest'

function getTier(
    candidate: ViewRefreshCandidate,
    config: RefreshConfig,
    now: number,
    activeViewIds: number[],
): Tier {
    if (activeViewIds.includes(candidate.viewId)) return 'active'
    if (isRecentlyViewed(candidate, config, now)) return 'recent'
    return 'rest'
}

const TIER_BONUS: Record<Tier, number> = {
    active: 10000,
    recent: 3000,
    rest: 0,
}

const IN_VIEWPORT_BONUS = 1500
const HIGH_PRIORITY_BONUS = 2000

export type ScoreViewParams = {
    candidate: ViewRefreshCandidate
    config: RefreshConfig
    now: number
    activeViewIds: number[]
}

/**
 * Computes a priority score for a view refresh candidate.
 *
 * Scoring is based on tiers, staleness, and modifiers:
 *
 * **Tiers** (based on view state):
 * - `active` — the view currently shown in the URL → +10000
 * - `recent` — viewed within the recently-active window → +3000
 * - `rest` — everything else → +0
 *
 * **Base score**: staleness in seconds since last fetch, capped at
 * `staleSeconds × STALENESS_CAP_MULTIPLIER` so very-old rest-tier views
 * can't accumulate priority and starve the active/in-viewport/recent
 * views. Never-fetched views start at the cap.
 *
 * **Modifiers** (applied in order after tier bonus):
 * 1. Never fetched: +6000 if in viewport, +3000 otherwise
 * 2. High priority (Inbox, Unassigned, All) AND stale AND not large:
 *    +2000 so the views agents care about most don't sit indefinitely on
 *    stale counts when they're not in viewport or in the URL.
 * 3. In viewport: +1500 flat bonus, then score × 1.5 (weighted more heavily
 *    since these views are the ones the user is actually looking at)
 * 4. Realtime views (chat) AND in viewport: score × 2
 * 5. Large count (≥ largeCountThreshold) AND not stale: score × 0.25
 * 6. Low priority (Trash, Spam) AND not stale: score × 0.1
 * 7. `rest` tier AND not stale AND not in viewport: score × 0.1
 * 8. Recently fetched (< staleSeconds) AND not `active`/`recent` tier
 *    AND not in viewport: score × 0.1
 *
 * Active, recent, and in-viewport views are exempt from the penalties in
 * steps 6-7 so they always outrank really-stale rest-tier views — unless
 * they've been refreshed within their cooldown, in which case `isEligible`
 * filters them out entirely.
 */
export function scoreView({
    candidate,
    config,
    now,
    activeViewIds,
}: ScoreViewParams): number {
    if (candidate.isDeactivated) return 0
    const staleness = getStalenessSeconds(candidate, config, now)
    const tier = getTier(candidate, config, now, activeViewIds)
    const stale = staleness >= config.staleSeconds

    const neverFetched = candidate.lastFetchedAt === null

    let score = staleness + TIER_BONUS[tier]

    if (neverFetched) {
        score += candidate.isInViewport ? 6000 : 3000
    }

    const isLarge = candidate.count >= config.largeCountThreshold
    if (candidate.isHighPriority && stale && !isLarge) {
        score += HIGH_PRIORITY_BONUS
    }

    if (candidate.isInViewport) {
        score += IN_VIEWPORT_BONUS
        score *= 1.5
    }

    if (candidate.isRealtimeView && candidate.isInViewport) {
        score *= 2
    }

    if (isLarge && !stale) {
        score *= 0.25
    }

    if (candidate.isLowPriority && !stale) {
        score *= 0.1
    }

    if (tier === 'rest' && !stale && !candidate.isInViewport) {
        score *= 0.1
    }

    const recentlyFetched = staleness < config.staleSeconds
    if (
        recentlyFetched &&
        tier !== 'active' &&
        tier !== 'recent' &&
        !candidate.isInViewport
    ) {
        score *= 0.1
    }

    return score
}

export type SelectViewsParams = {
    candidates: ViewRefreshCandidate[]
    config: RefreshConfig
    now: number
    activeViewIds: number[]
}

export function selectViewsToRefresh({
    candidates,
    config,
    now,
    activeViewIds,
}: SelectViewsParams): number[] {
    const eligible = candidates.filter((c) =>
        isEligible(c, config, now, activeViewIds),
    )
    const candidateById = new Map(eligible.map((c) => [c.viewId, c]))

    const scored = eligible
        .map((c) => ({
            viewId: c.viewId,
            score: scoreView({ candidate: c, config, now, activeViewIds }),
        }))
        .sort((a, b) => b.score - a.score)

    const selected: number[] = []
    let realtimeCount = 0

    for (const { viewId } of scored) {
        if (selected.length >= config.maxViewsPerTick) break
        const c = candidateById.get(viewId)
        if (c?.isRealtimeView) {
            if (realtimeCount >= config.maxRealtimePerTick) continue
            realtimeCount++
        }
        selected.push(viewId)
    }

    return selected
}
