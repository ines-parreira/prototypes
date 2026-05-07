export type RefreshConfig = {
    tickIntervalSeconds: number
    minRefreshIntervalSeconds: number
    maxViewsPerTick: number
    maxRealtimePerTick: number
    largeCountThreshold: number
    recentlyActiveWindowSeconds: number
    staleSeconds: number
}

export const DEFAULT_REFRESH_CONFIG: RefreshConfig = {
    tickIntervalSeconds: 30,
    minRefreshIntervalSeconds: 300,
    maxViewsPerTick: 5,
    maxRealtimePerTick: 2,
    largeCountThreshold: 100,
    recentlyActiveWindowSeconds: 300,
    staleSeconds: 600,
}

export type ViewRefreshCandidate = {
    viewId: number
    count: number
    lastFetchedAt: string | null
    lastViewedAt: string | null
    isRealtimeView: boolean
    isVisible: boolean
    isInViewport: boolean
    isSystemView: boolean
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

function getStalenessSeconds(
    candidate: ViewRefreshCandidate,
    config: RefreshConfig,
    now: number,
): number {
    if (!candidate.lastFetchedAt) return config.staleSeconds * 4
    return (now - new Date(candidate.lastFetchedAt).getTime()) / 1000
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

type Tier = 'active' | 'recent' | 'visible' | 'rest'

function getTier(
    candidate: ViewRefreshCandidate,
    config: RefreshConfig,
    now: number,
    activeViewIds: number[],
): Tier {
    if (activeViewIds.includes(candidate.viewId)) return 'active'
    if (isRecentlyViewed(candidate, config, now)) return 'recent'
    if (candidate.isVisible) return 'visible'
    return 'rest'
}

const TIER_BONUS: Record<Tier, number> = {
    active: 10000,
    recent: 3000,
    visible: 2000,
    rest: 0,
}

const IN_VIEWPORT_BONUS = 1500

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
 * - `visible` — expanded in the sidebar → +2000
 * - `rest` — everything else → +0
 *
 * **Base score**: staleness in seconds since last fetch.
 * Never-fetched views get `staleSeconds × 4` as base.
 *
 * **Modifiers** (applied in order after tier bonus):
 * 1. Never fetched: +6000 if in viewport, +5000 if visible, +3000 otherwise
 * 2. In viewport: +1500 flat bonus, then score × 1.5 (weighted more heavily
 *    since these views are the ones the user is actually looking at)
 * 3. Realtime views (chat) AND visible: score × 2
 * 4. Large count (≥ largeCountThreshold) AND not stale: score × 0.25
 * 5. Low priority (Trash, Spam) AND not stale: score × 0.1
 * 6. `rest` tier AND not stale: score × 0.1
 * 7. Recently fetched (< staleSeconds) AND not `active`/`recent` tier: score × 0.1
 *
 * "Stale" (≥ staleSeconds or never fetched) overrides
 * the penalties in steps 4-6 and guarantees at least the `visible` tier
 * bonus, ensuring all views eventually get refreshed regardless of
 * count size, priority, or visibility.
 *
 * Recently fetched views that aren't active or recently viewed get a heavy
 * penalty (step 7), pushing bandwidth toward staler views first.
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

    const tierBonus = stale
        ? Math.max(TIER_BONUS[tier], TIER_BONUS.visible)
        : TIER_BONUS[tier]
    let score = staleness + tierBonus

    if (neverFetched) {
        score += candidate.isInViewport
            ? 6000
            : candidate.isVisible
              ? 5000
              : 3000
    }

    if (candidate.isInViewport) {
        score += IN_VIEWPORT_BONUS
        score *= 1.5
    }

    if (candidate.isRealtimeView && candidate.isVisible) {
        score *= 2
    }

    if (candidate.count >= config.largeCountThreshold && !stale) {
        score *= 0.25
    }

    if (candidate.isLowPriority && !stale) {
        score *= 0.1
    }

    if (tier === 'rest' && !stale) {
        score *= 0.1
    }

    const recentlyFetched = staleness < config.staleSeconds
    if (recentlyFetched && tier !== 'active' && tier !== 'recent') {
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
