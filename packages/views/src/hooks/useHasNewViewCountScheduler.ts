import {
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from './useViewCountSchedulerVersion'

/**
 * Returns true whenever a non-legacy scheduler is in charge (smart or
 * simple). Kept as a thin alias over `useViewCountSchedulerVersion` so the
 * legacy polling gates (`usePollingManager`, `useInitialViewCountsFetch`)
 * keep their existing semantics — they should stay off whenever any newer
 * scheduler is on, regardless of which one.
 *
 * For starting the smart-vs-simple scheduler itself, gate on
 * `useViewCountSchedulerVersion` explicitly — the boolean returned here
 * does not distinguish between them.
 */
export function useHasNewViewCountScheduler(): {
    value: boolean
    isLoading: boolean
} {
    const { version, isLoading } = useViewCountSchedulerVersion()
    return {
        value: version !== ViewCountSchedulerVersion.Legacy,
        isLoading,
    }
}
