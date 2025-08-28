import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { useAiAgentTypeForAccount } from 'pages/aiAgent/Overview/hooks/useAiAgentType'

export function useIsHrtAiEnabled() {
    const isFeatureFlagEnabled = useFlag<boolean>(
        FeatureFlagKey.ReportingHrtAi,
        false,
    )

    const { aiAgentType } = useAiAgentTypeForAccount()
    const isAiAgentEnabled = aiAgentType !== undefined

    return isAiAgentEnabled && isFeatureFlagEnabled
}
