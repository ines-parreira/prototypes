import {
    FeatureFlagKey,
    useFlagWithLoading,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'

/**
 * Resolves which view count refresh implementation is active for the
 * current session. Exactly one is in charge at a time; higher numbers
 * take precedence.
 *
 * - `Legacy` (1): the pre-scheduler Redux `pollingManager` — runs when no
 *   newer flag is on. Gates `usePollingManager` and the boot-time
 *   `fetchVisibleViewsCounts` call.
 * - `V2` (2): the scoring-based scheduler with viewport tracking and
 *   leader election. Gated by the Helpdesk v2 baseline flag.
 * - `V3` (3): the LRU + flat-TTL scheduler mirroring the pre-scheduler
 *   semantics with a leader-elected, once-per-session boot fetch. Gated
 *   by `ViewCountSchedulerV3`.
 */
export enum ViewCountSchedulerVersion {
    Legacy = 1,
    V2 = 2,
    V3 = 3,
}

export function useViewCountSchedulerVersion(): {
    version: ViewCountSchedulerVersion
    isLoading: boolean
} {
    const { value: hasSchedulerV3, isLoading: loadingV3 } = useFlagWithLoading(
        FeatureFlagKey.ViewCountSchedulerV3,
        false,
    )
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const { isLoading: loadingV2 } = useFlagWithLoading(
        FeatureFlagKey.UIVisionBetaBaseline,
    )

    const isLoading = loadingV3 || loadingV2

    if (hasSchedulerV3) {
        return { version: ViewCountSchedulerVersion.V3, isLoading }
    }
    if (hasUIVisionBeta) {
        return { version: ViewCountSchedulerVersion.V2, isLoading }
    }
    return { version: ViewCountSchedulerVersion.Legacy, isLoading }
}
