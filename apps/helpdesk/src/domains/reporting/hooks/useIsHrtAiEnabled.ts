import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

export function useIsHrtAiEnabled() {
    const isFeatureFlagEnabled = useFlag<boolean>(
        FeatureFlagKey.ReportingHrtAi,
        false,
    )

    const { hasAccess } = useAiAgentAccess()

    return hasAccess && isFeatureFlagEnabled
}
