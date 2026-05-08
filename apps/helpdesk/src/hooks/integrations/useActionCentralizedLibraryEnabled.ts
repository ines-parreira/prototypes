import type { ActionCentralizedLibraryMilestone } from '@repo/feature-flags'
import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

export function useActionCentralizedLibraryEnabled(): {
    isEnabled: boolean
    milestone: ActionCentralizedLibraryMilestone
    isLoading: boolean
} {
    const { value, isLoading } =
        useFlagWithLoading<ActionCentralizedLibraryMilestone>(
            FeatureFlagKey.ActionCentralizedLibrary,
            'OFF',
        )

    return {
        isEnabled: value !== 'OFF',
        milestone: value,
        isLoading,
    }
}
