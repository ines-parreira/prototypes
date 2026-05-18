import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Loader } from '@gorgias/axiom'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { AIAgentWelcomePageViewV3 } from 'pages/aiAgent/components/AIAgentWelcomePageViewV3/AIAgentWelcomePageViewV3'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { hasAutomatePlanAboveGen6 } from 'pages/aiAgent/utils/trial.utils'

import { AIAgentWelcomePageViewV2 } from './AIAgentWelcomePageViewV2'

export type DynamicItem = {
    checked: boolean
    link?: string
}

export type AiAgentWelcomePageProps = {
    accountDomain: string
    shopType: string
    shopName: string
    storeConfiguration?: StoreConfiguration
}

export const AIAgentWelcomePageView = (props: AiAgentWelcomePageProps) => {
    const { value: isV3FlagOn, isLoading: isFlagLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentOnboardingV3,
        false,
    )

    const trialAccess = useTrialAccess(props.shopName)
    const isTrialAccessLoading =
        trialAccess.isLoading === true || trialAccess.isOnboarded === undefined

    const canStartOnboarding =
        (trialAccess.hasCurrentStoreTrialExpired ||
            trialAccess.isTrialingSubscription ||
            hasAutomatePlanAboveGen6(trialAccess.currentAutomatePlan)) &&
        trialAccess.isOnboarded === false

    if (isFlagLoading) {
        return <CenteredLoader />
    }

    // Block on trial/onboarding loading only when V3 could win — otherwise V2
    // owns its own internal loading and we should not delay it.
    if (isV3FlagOn && isTrialAccessLoading) {
        return <CenteredLoader />
    }

    // Matches V2's `useAiAgentCtas` rule: "If onboarding is possible, anyone
    // can start it" — so V3 only gates on `canStartOnboarding`. The route-level
    // role guard already blocks Basic/Observer/Lite agents from reaching here.
    if (isV3FlagOn && canStartOnboarding) {
        return (
            <AIAgentWelcomePageViewV3
                shopName={props.shopName}
                storeConfiguration={props.storeConfiguration}
            />
        )
    }

    return <AIAgentWelcomePageViewV2 {...props} />
}

const CenteredLoader = () => (
    <Box alignItems="center" justifyContent="center" width="100%" height="100%">
        <Loader size="sm" aria-label="Loading" />
    </Box>
)
