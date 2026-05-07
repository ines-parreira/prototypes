import {
    FeatureFlagKey,
    useFlagWithLoading,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'

/**
 * Gates the new view count scheduler on both the Helpdesk v2 baseline flag
 * and the user's local Helpdesk v2 toggle. The legacy scheduler keeps
 * running whenever either is off so users opting out of the new UI don't
 * end up on the new scheduler in isolation.
 */
export function useHasNewViewCountScheduler(): {
    value: boolean
    isLoading: boolean
} {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const { isLoading } = useFlagWithLoading(
        FeatureFlagKey.UIVisionBetaBaseline,
    )

    return { value: hasUIVisionBeta, isLoading }
}
