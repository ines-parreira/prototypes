import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useCurrentUserRole } from '@repo/users'

import useAppSelector from 'hooks/useAppSelector'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { hasAutomatePlanAboveGen6 } from 'pages/aiAgent/utils/trial.utils'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

type Result = {
    isEligible: boolean
    isV3FlagOn: boolean
    shopName: string | undefined
}

export const useV3AdminPaywallCta = (): Result => {
    const { isAdmin } = useCurrentUserRole()
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)
    const shopName = storeIntegrations[0]?.meta.shop_name

    const { value: isV3FlagOn } = useFlagWithLoading(
        FeatureFlagKey.AiAgentOnboardingV3,
        false,
    )

    const trialAccess = useTrialAccess(shopName)

    const canStartOnboarding =
        trialAccess.hasCurrentStoreTrialExpired ||
        trialAccess.isTrialingSubscription ||
        hasAutomatePlanAboveGen6(trialAccess.currentAutomatePlan)

    const isEligible =
        isV3FlagOn &&
        isAdmin &&
        !trialAccess.isOnboarded &&
        (canStartOnboarding ||
            trialAccess.canSeeTrialCTA ||
            trialAccess.canSeeSubscribeNowCTA ||
            trialAccess.isInAiAgentTrial)

    return { isEligible, isV3FlagOn, shopName }
}
