import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

export function useCustomAgentUnavailableStatusesFlag() {
    return useFlag(FeatureFlagKey.CustomAgentUnavailableStatuses)
}
