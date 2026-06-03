import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useCurrentUserRole } from '@repo/users'

import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
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
    const { value: isExpandingTrialForAllEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
        false,
    )

    const trialAccess = useTrialAccess(shopName)

    const { storeConfiguration, isLoading: isStoreConfigLoading } =
        useAiAgentStoreConfigurationContext()

    const isAiAgentAlreadyLive = storeConfiguration
        ? isAiAgentEnabledForStore(storeConfiguration)
        : false

    // `canSeeTrialCTA` needs a self-serve GMV band, but V2 offered the trial to
    // any helpdesk-trialing merchant via `canStartOnboarding`. Re-offer it here,
    // scoped to the no-automate AI Agent type and the expanding kill-switch:
    // `useTrialAccess` exposes `isTrialingSubscription`/`trialType` even when
    // restricted, and a has-automate account resolves to ShoppingAssistant (stays
    // suppressed).
    const isEligibleForTrialOptIn = Boolean(
        trialAccess.canSeeTrialCTA ||
        (isExpandingTrialForAllEnabled === true &&
            trialAccess.isTrialingSubscription &&
            trialAccess.trialType === TrialType.AiAgent),
    )

    const needsOptIn =
        isV3FlagOn &&
        isAdmin &&
        !isStoreConfigLoading &&
        !isAiAgentAlreadyLive &&
        !trialAccess.isInAiAgentTrial &&
        !trialAccess.hasAiAgentStoreTrialStarted &&
        isEligibleForTrialOptIn

    return { needsOptIn }
}
