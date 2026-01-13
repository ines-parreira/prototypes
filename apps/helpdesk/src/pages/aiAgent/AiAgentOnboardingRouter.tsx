import type { FC } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { AiAgentOnboarding } from 'pages/aiAgent/Onboarding/components/AiAgentOnboarding/AiAgentOnboarding'
import { AiAgentOnboarding as AiAgentOnboardingV2 } from 'pages/aiAgent/Onboarding_V2/components/AiAgentOnboarding/AiAgentOnboarding'

/**
 * Router component that conditionally renders the old or new onboarding flow
 * based on the SimplifyAIAgentOnboardingWizard feature flag.
 */
export const AiAgentOnboardingRouter: FC = () => {
    const isSimplifiedAiAgentOnboardingEnabled = useFlag(
        FeatureFlagKey.SimplifyAIAgentOnboardingWizard,
    )

    return isSimplifiedAiAgentOnboardingEnabled ? (
        <AiAgentOnboardingV2 />
    ) : (
        <AiAgentOnboarding />
    )
}
