import type {
    RefreshConfig,
    ViewRefreshCandidate,
} from '../selectViewsToRefresh'
import {
    isEligible,
    scoreView,
    selectViewsToRefresh,
} from '../selectViewsToRefresh'

const NOW = new Date('2026-04-10T12:00:00Z').getTime()

// Tests pin their own config so production tuning of DEFAULT_REFRESH_CONFIG
// doesn't reshape time/count fixtures here.
const CONFIG: RefreshConfig = {
    tickIntervalSeconds: 5,
    minRefreshIntervalSeconds: 30,
    maxViewsPerTick: 10,
    maxRealtimePerTick: 3,
    largeCountThreshold: 1000,
    recentlyActiveWindowSeconds: 300,
    staleSeconds: 120,
}

function candidate(
    overrides: Partial<ViewRefreshCandidate> & { viewId: number },
): ViewRefreshCandidate {
    return {
        count: 50,
        lastFetchedAt: new Date(NOW - 60_000).toISOString(),
        lastViewedAt: null,
        isRealtimeView: false,
        isVisible: true,
        isInViewport: false,
        isSystemView: false,
        isLowPriority: false,
        isDeactivated: false,
        ...overrides,
    }
}

function score(c: ViewRefreshCandidate, activeViewIds: number[] = []): number {
    return scoreView({ candidate: c, config: CONFIG, now: NOW, activeViewIds })
}

describe('isEligible', () => {
    it('returns true when never fetched', () => {
        const c = candidate({ viewId: 1, lastFetchedAt: null })

        expect(isEligible(c, CONFIG, NOW)).toBe(true)
    })

    it('returns true when stale enough', () => {
        const c = candidate({
            viewId: 1,
            lastFetchedAt: new Date(NOW - 60_000).toISOString(),
        })

        expect(isEligible(c, CONFIG, NOW)).toBe(true)
    })

    it('returns false when recently fetched', () => {
        const c = candidate({
            viewId: 1,
            lastFetchedAt: new Date(NOW - 10_000).toISOString(),
        })

        expect(isEligible(c, CONFIG, NOW)).toBe(false)
    })

    it('returns false when deactivated', () => {
        const c = candidate({
            viewId: 1,
            isDeactivated: true,
            lastFetchedAt: null,
        })

        expect(isEligible(c, CONFIG, NOW)).toBe(false)
    })

    it('uses shorter cooldown for active views', () => {
        const fetchedAt = new Date(
            NOW - CONFIG.tickIntervalSeconds * 2 * 1000,
        ).toISOString()
        const c = candidate({ viewId: 1, lastFetchedAt: fetchedAt })

        expect(isEligible(c, CONFIG, NOW, [1])).toBe(true)
        expect(isEligible(c, CONFIG, NOW, [])).toBe(false)
    })
})

describe('scoreView', () => {
    describe('tiers', () => {
        it('active view scores highest', () => {
            const c = candidate({ viewId: 1 })

            expect(score(c, [1])).toBeGreaterThan(score(c))
        })

        it('recently viewed scores higher than just visible', () => {
            const recent = candidate({
                viewId: 1,
                lastViewedAt: new Date(NOW - 30_000).toISOString(),
            })
            const visible = candidate({ viewId: 2 })

            expect(score(recent)).toBeGreaterThan(score(visible))
        })

        it('visible scores higher than rest', () => {
            const visible = candidate({ viewId: 1, isVisible: true })
            const rest = candidate({ viewId: 2, isVisible: false })

            expect(score(visible)).toBeGreaterThan(score(rest))
        })
    })

    describe('staleness', () => {
        it('staler views score higher within the same tier', () => {
            const stale = candidate({
                viewId: 1,
                lastFetchedAt: new Date(NOW - 120_000).toISOString(),
            })
            const fresh = candidate({
                viewId: 2,
                lastFetchedAt: new Date(NOW - 60_000).toISOString(),
            })

            expect(score(stale)).toBeGreaterThan(score(fresh))
        })

        it('never-fetched views score as very stale', () => {
            const neverFetched = candidate({
                viewId: 1,
                lastFetchedAt: null,
            })
            const fetched = candidate({
                viewId: 2,
                lastFetchedAt: new Date(NOW - 60_000).toISOString(),
            })

            expect(score(neverFetched)).toBeGreaterThan(score(fetched))
        })
    })

    describe('modifiers', () => {
        it('realtime views get doubled score', () => {
            const realtime = candidate({ viewId: 1, isRealtimeView: true })
            const normal = candidate({ viewId: 2, isRealtimeView: false })

            expect(score(realtime)).toBeGreaterThan(score(normal))
        })

        it('system views score the same as regular visible views', () => {
            const system = candidate({ viewId: 1, isSystemView: true })
            const normal = candidate({ viewId: 2, isSystemView: false })

            expect(score(system)).toBe(score(normal))
        })

        it('large count views are penalized when not really stale', () => {
            const large = candidate({ viewId: 1, count: 1500 })
            const small = candidate({ viewId: 2, count: 50 })

            expect(score(large)).toBeLessThan(score(small))
        })

        it('large count penalty is skipped when really stale', () => {
            const largeAndStale = candidate({
                viewId: 1,
                count: 1500,
                lastFetchedAt: null,
            })
            const smallAndStale = candidate({
                viewId: 2,
                count: 50,
                lastFetchedAt: null,
            })

            expect(score(largeAndStale)).toBe(score(smallAndStale))
        })

        it('low priority views are penalized when not really stale', () => {
            const lowPri = candidate({ viewId: 1, isLowPriority: true })
            const normal = candidate({ viewId: 2, isLowPriority: false })

            expect(score(lowPri)).toBeLessThan(score(normal))
        })

        it('low priority penalty is skipped when really stale', () => {
            const lowPriStale = candidate({
                viewId: 1,
                isLowPriority: true,
                lastFetchedAt: null,
            })
            const normalStale = candidate({
                viewId: 2,
                isLowPriority: false,
                lastFetchedAt: null,
            })

            expect(score(lowPriStale)).toBe(score(normalStale))
        })
    })

    describe('deactivated', () => {
        it('returns 0 for deactivated views', () => {
            const c = candidate({ viewId: 1, isDeactivated: true })

            expect(score(c)).toBe(0)
        })
    })

    describe('viewport boost', () => {
        it('never-fetched in-viewport views get the highest boost', () => {
            const inViewport = candidate({
                viewId: 1,
                lastFetchedAt: null,
                isInViewport: true,
                isVisible: true,
            })
            const visible = candidate({
                viewId: 2,
                lastFetchedAt: null,
                isInViewport: false,
                isVisible: true,
            })
            const hidden = candidate({
                viewId: 3,
                lastFetchedAt: null,
                isInViewport: false,
                isVisible: false,
            })

            expect(score(inViewport)).toBeGreaterThan(score(visible))
            expect(score(visible)).toBeGreaterThan(score(hidden))
        })

        it('in-viewport boost applies to fetched views', () => {
            const inViewport = candidate({
                viewId: 1,
                isInViewport: true,
            })
            const notInViewport = candidate({
                viewId: 2,
                isInViewport: false,
            })

            expect(score(inViewport)).toBeGreaterThan(score(notInViewport))
        })

        it('in-viewport boost is weightier than the 1.5x multiplier alone', () => {
            // The in-viewport path adds a flat bonus on top of the 1.5x
            // multiplier, so the resulting score should exceed what the
            // multiplier alone would produce.
            const inViewport = candidate({
                viewId: 1,
                isInViewport: true,
            })
            const notInViewport = candidate({
                viewId: 2,
                isInViewport: false,
            })

            const withMultiplierOnly = score(notInViewport) * 1.5
            expect(score(inViewport)).toBeGreaterThan(withMultiplierOnly)
        })

        it('in-viewport stale rest-tier view outranks a fresh visible non-viewport view', () => {
            const inViewportStaleRest = candidate({
                viewId: 1,
                isInViewport: true,
                isVisible: false,
                lastFetchedAt: null,
            })
            const freshVisible = candidate({
                viewId: 2,
                isInViewport: false,
                isVisible: true,
                lastFetchedAt: new Date(NOW - 30_000).toISOString(),
            })

            expect(score(inViewportStaleRest)).toBeGreaterThan(
                score(freshVisible),
            )
        })
    })

    describe('recently fetched penalty', () => {
        it('penalizes recently fetched visible views that are not active or recent', () => {
            const recentlyFetched = candidate({
                viewId: 1,
                lastFetchedAt: new Date(
                    NOW - (CONFIG.staleSeconds - 10) * 1000,
                ).toISOString(),
            })
            const stale = candidate({
                viewId: 2,
                lastFetchedAt: new Date(
                    NOW - (CONFIG.staleSeconds + 10) * 1000,
                ).toISOString(),
            })

            expect(score(stale)).toBeGreaterThan(score(recentlyFetched))
        })

        it('does not penalize recently fetched active views', () => {
            const recentActive = candidate({
                viewId: 1,
                lastFetchedAt: new Date(
                    NOW - (CONFIG.staleSeconds - 10) * 1000,
                ).toISOString(),
            })

            const scoreAsActive = score(recentActive, [1])
            const scoreAsRest = score(recentActive, [])

            expect(scoreAsActive).toBeGreaterThan(scoreAsRest)
        })
    })

    describe('really stale override', () => {
        it('really stale rest-tier view scores higher than fresh visible view with large count', () => {
            const staleRest = candidate({
                viewId: 1,
                isVisible: false,
                lastFetchedAt: null,
            })
            const freshLargeVisible = candidate({
                viewId: 2,
                isVisible: true,
                count: 1500,
                lastFetchedAt: new Date(NOW - 60_000).toISOString(),
            })

            expect(score(staleRest)).toBeGreaterThan(score(freshLargeVisible))
        })
    })
})

describe('selectViewsToRefresh', () => {
    it('returns empty array when no candidates', () => {
        expect(
            selectViewsToRefresh({
                candidates: [],
                config: CONFIG,
                now: NOW,
                activeViewIds: [],
            }),
        ).toEqual([])
    })

    it('excludes deactivated candidates', () => {
        const candidates = [
            candidate({ viewId: 1, isDeactivated: true, lastFetchedAt: null }),
            candidate({
                viewId: 2,
                lastFetchedAt: new Date(NOW - 60_000).toISOString(),
            }),
        ]

        const result = selectViewsToRefresh({
            candidates,
            config: CONFIG,
            now: NOW,
            activeViewIds: [],
        })

        expect(result).toEqual([2])
    })

    it('filters out ineligible candidates', () => {
        const candidates = [
            candidate({
                viewId: 1,
                lastFetchedAt: new Date(NOW - 5_000).toISOString(),
            }),
        ]

        expect(
            selectViewsToRefresh({
                candidates,
                config: CONFIG,
                now: NOW,
                activeViewIds: [],
            }),
        ).toEqual([])
    })

    it('returns view IDs sorted by score descending', () => {
        const candidates = [
            candidate({
                viewId: 1,
                lastFetchedAt: new Date(NOW - 60_000).toISOString(),
            }),
            candidate({
                viewId: 2,
                lastFetchedAt: new Date(NOW - 120_000).toISOString(),
            }),
        ]

        const result = selectViewsToRefresh({
            candidates,
            config: CONFIG,
            now: NOW,
            activeViewIds: [],
        })

        expect(result).toEqual([2, 1])
    })

    it('respects maxViewsPerTick', () => {
        const config = { ...CONFIG, maxViewsPerTick: 2 }
        const candidates = Array.from({ length: 5 }, (_, i) =>
            candidate({
                viewId: i + 1,
                lastFetchedAt: new Date(NOW - 60_000).toISOString(),
            }),
        )

        const result = selectViewsToRefresh({
            candidates,
            config,
            now: NOW,
            activeViewIds: [],
        })

        expect(result).toHaveLength(2)
    })

    it('prioritizes the active view', () => {
        const candidates = [
            candidate({
                viewId: 1,
                lastFetchedAt: new Date(NOW - 120_000).toISOString(),
            }),
            candidate({
                viewId: 2,
                lastFetchedAt: new Date(NOW - 60_000).toISOString(),
            }),
        ]

        const result = selectViewsToRefresh({
            candidates,
            config: CONFIG,
            now: NOW,
            activeViewIds: [2],
        })

        expect(result[0]).toBe(2)
    })

    it('caps realtime views per tick', () => {
        const config = { ...CONFIG, maxViewsPerTick: 5, maxRealtimePerTick: 2 }
        const candidates = [
            ...Array.from({ length: 4 }, (_, i) =>
                candidate({
                    viewId: i + 1,
                    isRealtimeView: true,
                    lastFetchedAt: new Date(NOW - 60_000).toISOString(),
                }),
            ),
            candidate({
                viewId: 10,
                isRealtimeView: false,
                lastFetchedAt: new Date(NOW - 60_000).toISOString(),
            }),
        ]

        const result = selectViewsToRefresh({
            candidates,
            config,
            now: NOW,
            activeViewIds: [],
        })

        const realtimeSelected = result.filter((id) => id <= 4)
        expect(realtimeSelected).toHaveLength(2)
        expect(result).toContain(10)
    })
})

describe('multi-pass simulation', () => {
    const TICK_INTERVAL = CONFIG.tickIntervalSeconds * 1000

    function simulateTicks(
        initial: ViewRefreshCandidate[],
        ticks: number,
        config = CONFIG,
        activeViewIds: number[] = [],
    ): { refreshedPerView: Map<number, number>; allRefreshed: Set<number> } {
        const refreshedPerView = new Map<number, number>()
        const allRefreshed = new Set<number>()

        const state = initial.map((c) => ({ ...c }))

        let now = NOW

        for (let t = 0; t < ticks; t++) {
            now += TICK_INTERVAL

            const selected = selectViewsToRefresh({
                candidates: state,
                config,
                now,
                activeViewIds,
            })

            for (const viewId of selected) {
                allRefreshed.add(viewId)
                refreshedPerView.set(
                    viewId,
                    (refreshedPerView.get(viewId) ?? 0) + 1,
                )
                const entry = state.find((c) => c.viewId === viewId)
                if (entry) {
                    entry.lastFetchedAt = new Date(now).toISOString()
                }
            }
        }

        return { refreshedPerView, allRefreshed }
    }

    it('eventually refreshes all views given enough ticks', () => {
        const views = Array.from({ length: 30 }, (_, i) =>
            candidate({
                viewId: i + 1,
                lastFetchedAt: null,
                isVisible: i < 10,
            }),
        )

        const { allRefreshed } = simulateTicks(views, 100)

        expect(allRefreshed.size).toBe(30)
    })

    it('refreshes visible views more frequently than non-visible', () => {
        const views = [
            ...Array.from({ length: 5 }, (_, i) =>
                candidate({
                    viewId: i + 1,
                    isVisible: true,
                    lastFetchedAt: null,
                }),
            ),
            ...Array.from({ length: 15 }, (_, i) =>
                candidate({
                    viewId: i + 100,
                    isVisible: false,
                    lastFetchedAt: null,
                }),
            ),
        ]

        const config = { ...CONFIG, maxViewsPerTick: 3 }
        const { refreshedPerView } = simulateTicks(views, 500, config)

        const avgVisible =
            [1, 2, 3, 4, 5].reduce(
                (sum, id) => sum + (refreshedPerView.get(id) ?? 0),
                0,
            ) / 5
        const avgNonVisible =
            Array.from({ length: 15 }, (_, i) => i + 100).reduce(
                (sum, id) => sum + (refreshedPerView.get(id) ?? 0),
                0,
            ) / 15

        expect(avgVisible).toBeGreaterThan(avgNonVisible)
    })

    it('always picks the active view first when eligible', () => {
        const views = Array.from({ length: 10 }, (_, i) =>
            candidate({ viewId: i + 1, isVisible: true, lastFetchedAt: null }),
        )

        const config = { ...CONFIG, maxViewsPerTick: 3 }
        const state = views.map((c) => ({ ...c }))
        let now = NOW

        for (let t = 0; t < 100; t++) {
            now += TICK_INTERVAL

            const selected = selectViewsToRefresh({
                candidates: state,
                config,
                now,
                activeViewIds: [1],
            })

            if (selected.length > 0) {
                const activeEligible = isEligible(state[0], config, now)
                if (activeEligible) {
                    expect(selected[0]).toBe(1)
                }

                for (const viewId of selected) {
                    const entry = state.find((c) => c.viewId === viewId)
                    if (entry) {
                        entry.lastFetchedAt = new Date(now).toISOString()
                    }
                }
            }
        }
    })

    it('does not starve non-visible views indefinitely', () => {
        const views = [
            ...Array.from({ length: 10 }, (_, i) =>
                candidate({
                    viewId: i + 1,
                    isVisible: true,
                    lastFetchedAt: null,
                }),
            ),
            ...Array.from({ length: 10 }, (_, i) =>
                candidate({
                    viewId: i + 100,
                    isVisible: false,
                    lastFetchedAt: null,
                }),
            ),
        ]

        const { allRefreshed } = simulateTicks(views, 200)

        const nonVisibleRefreshed = [...allRefreshed].filter((id) => id >= 100)
        expect(nonVisibleRefreshed.length).toBe(10)
    })

    it('low priority views still get refreshed eventually', () => {
        const views = [
            ...Array.from({ length: 5 }, (_, i) =>
                candidate({
                    viewId: i + 1,
                    isVisible: true,
                    lastFetchedAt: null,
                }),
            ),
            candidate({
                viewId: 99,
                isVisible: true,
                isLowPriority: true,
                lastFetchedAt: null,
            }),
        ]

        const { allRefreshed } = simulateTicks(views, 100)

        expect(allRefreshed).toContain(99)
    })

    it('large count views still get refreshed but less often', () => {
        const views = [
            ...Array.from({ length: 5 }, (_, i) =>
                candidate({
                    viewId: i + 1,
                    isVisible: true,
                    count: 50,
                    lastFetchedAt: null,
                }),
            ),
            ...Array.from({ length: 5 }, (_, i) =>
                candidate({
                    viewId: i + 100,
                    isVisible: true,
                    count: 5000,
                    lastFetchedAt: null,
                }),
            ),
        ]

        const config = { ...CONFIG, maxViewsPerTick: 3 }
        const { refreshedPerView } = simulateTicks(views, 500, config)

        const avgSmall =
            [1, 2, 3, 4, 5].reduce(
                (sum, id) => sum + (refreshedPerView.get(id) ?? 0),
                0,
            ) / 5
        const avgLarge =
            Array.from({ length: 5 }, (_, i) => i + 100).reduce(
                (sum, id) => sum + (refreshedPerView.get(id) ?? 0),
                0,
            ) / 5

        expect(avgSmall).toBeGreaterThan(avgLarge)
        expect(avgLarge).toBeGreaterThan(0)
    })

    it('exhausts 300 never-fetched views within a reasonable number of ticks', () => {
        const views = [
            // 7 system views (Inbox, Unassigned, All, Snoozed, Closed, Trash, Spam)
            ...Array.from({ length: 7 }, (_, i) =>
                candidate({
                    viewId: i + 1,
                    isSystemView: true,
                    isVisible: true,
                    isLowPriority: i >= 5, // Trash, Spam
                    lastFetchedAt: null,
                }),
            ),
            // 10 realtime (chat) visible views
            ...Array.from({ length: 10 }, (_, i) =>
                candidate({
                    viewId: i + 100,
                    isRealtimeView: true,
                    isVisible: true,
                    lastFetchedAt: null,
                }),
            ),
            // 40 visible views in expanded sections
            ...Array.from({ length: 40 }, (_, i) =>
                candidate({
                    viewId: i + 200,
                    isVisible: true,
                    lastFetchedAt: null,
                }),
            ),
            // 20 visible views with large counts
            ...Array.from({ length: 20 }, (_, i) =>
                candidate({
                    viewId: i + 300,
                    isVisible: true,
                    count: 5000,
                    lastFetchedAt: null,
                }),
            ),
            // 223 non-visible views (collapsed sections)
            ...Array.from({ length: 223 }, (_, i) =>
                candidate({
                    viewId: i + 400,
                    isVisible: false,
                    lastFetchedAt: null,
                }),
            ),
        ]

        expect(views).toHaveLength(300)

        const { allRefreshed } = simulateTicks(
            views,
            1000,
            CONFIG,
            [1], // Inbox is active
        )

        expect(allRefreshed.size).toBe(300)

        // Find tick count needed to exhaust all views
        const state = views.map((c) => ({ ...c }))
        let now = NOW
        let ticksToExhaust = 0
        const seen = new Set<number>()

        for (let t = 0; t < 10000; t++) {
            now += TICK_INTERVAL
            const selected = selectViewsToRefresh({
                candidates: state,
                config: CONFIG,
                now,
                activeViewIds: [1],
            })
            for (const viewId of selected) {
                seen.add(viewId)
                const entry = state.find((c) => c.viewId === viewId)
                if (entry) {
                    entry.lastFetchedAt = new Date(now).toISOString()
                }
            }
            if (seen.size === 300) {
                ticksToExhaust = t + 1
                break
            }
        }

        // Should exhaust within a reasonable time
        expect(ticksToExhaust).toBeGreaterThan(0)
        expect(ticksToExhaust).toBeLessThan(500)
    })

    it('realtime views do not starve non-realtime views', () => {
        const views = [
            ...Array.from({ length: 8 }, (_, i) =>
                candidate({
                    viewId: i + 1,
                    isVisible: true,
                    isRealtimeView: true,
                    lastFetchedAt: null,
                }),
            ),
            ...Array.from({ length: 4 }, (_, i) =>
                candidate({
                    viewId: i + 100,
                    isVisible: true,
                    isRealtimeView: false,
                    lastFetchedAt: null,
                }),
            ),
        ]

        const { refreshedPerView } = simulateTicks(views, 100)

        const nonRealtimeTotal = [100, 101, 102, 103].reduce(
            (sum, id) => sum + (refreshedPerView.get(id) ?? 0),
            0,
        )
        expect(nonRealtimeTotal).toBeGreaterThan(0)
    })
})
