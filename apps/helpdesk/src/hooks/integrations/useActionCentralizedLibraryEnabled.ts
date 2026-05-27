import type { ActionCentralizedLibraryMilestone } from '@repo/feature-flags'
import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

const MILESTONE_RANK: Record<string, number> = {
    OFF: 0,
    'MILESTONE-1': 1,
    'MILESTONE-2': 2,
    'MILESTONE-3': 3,
}

const rankOf = (value: string | undefined): number => {
    if (!value) return 0
    return MILESTONE_RANK[value.toUpperCase().replace(/_/g, '-')] ?? 0
}

export function isAtLeastMilestone(
    current: ActionCentralizedLibraryMilestone | string | undefined,
    target: Exclude<ActionCentralizedLibraryMilestone, 'OFF'>,
): boolean {
    return rankOf(current) >= rankOf(target)
}

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
