import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

export function useCopilotEnabled(): boolean {
    return useFlag(FeatureFlagKey.EnableCopilotUi, false)
}
