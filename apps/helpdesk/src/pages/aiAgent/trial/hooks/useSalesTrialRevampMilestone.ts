import { FeatureFlagKey } from '@repo/feature-flags'

import useFlag from 'core/flags/hooks/useFlag'

/** This feature flag is now fully activated on the milestone-1 */
export type SalesTrialRevampMilestone = 'off' | 'milestone-0' | 'milestone-1'

/**
 * Hook to get the current milestone for the Sales Trial Revamp feature.
 * This replaces the boolean ShoppingAssistantTrialRevamp flag with a 3-variation string flag.
 *
 * @returns {SalesTrialRevampMilestone} The current milestone: 'off', 'milestone-0', or 'milestone-1'
 */
export const useSalesTrialRevampMilestone = (): SalesTrialRevampMilestone => {
    const milestone = useFlag<SalesTrialRevampMilestone>(
        FeatureFlagKey.ShoppingAssistantTrialRevampMilestone,
        'off',
    )

    return milestone
}
