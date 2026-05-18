import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

/**
 * Resolves which view count refresh implementation is active for the
 * current session. Exactly one is in charge at a time.
 *
 * - `Legacy` (1): the pre-scheduler Redux `pollingManager` — runs when no
 *   newer flag is on. Gates `usePollingManager` and the boot-time
 *   `fetchVisibleViewsCounts` call.
 * - `V3` (3): the LRU + flat-TTL scheduler with per-view staleness on
 *   leader takeover. Gated by `ViewCountSchedulerV3`.
 *
 * The previously-shipped V2 (scoring + viewport tracking) was retired;
 * accounts that were on its flag fall back to Legacy until V3 ships to
 * them.
 */
export enum ViewCountSchedulerVersion {
    Legacy = 1,
    V3 = 3,
}

export function useViewCountSchedulerVersion(): {
    version: ViewCountSchedulerVersion
    isLoading: boolean
} {
    const { value: hasSchedulerV3, isLoading } = useFlagWithLoading(
        FeatureFlagKey.ViewCountSchedulerV3,
        false,
    )

    if (hasSchedulerV3) {
        return { version: ViewCountSchedulerVersion.V3, isLoading }
    }
    return { version: ViewCountSchedulerVersion.Legacy, isLoading }
}
