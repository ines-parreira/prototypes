import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useCurrentUserRole } from '@repo/users'

import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'

type Result = {
    needsOptIn: boolean
}

export const useNeedsAiAgentTrialOptIn = (
    shopName: string | undefined,
): Result => {
    const { isAdmin } = useCurrentUserRole()

    const { value: isV3FlagOn } = useFlagWithLoading(
        FeatureFlagKey.AiAgentOnboardingV3,
        false,
    )

    const trialAccess = useTrialAccess(shopName)

    const { storeConfiguration, isLoading: isStoreConfigLoading } =
        useAiAgentStoreConfigurationContext()

    const isAiAgentAlreadyLive = storeConfiguration
        ? isAiAgentEnabledForStore(storeConfiguration)
        : false

    const needsOptIn =
        isV3FlagOn &&
        isAdmin &&
        !isStoreConfigLoading &&
        !isAiAgentAlreadyLive &&
        !trialAccess.isInAiAgentTrial &&
        trialAccess.canSeeTrialCTA

    return { needsOptIn }
}
