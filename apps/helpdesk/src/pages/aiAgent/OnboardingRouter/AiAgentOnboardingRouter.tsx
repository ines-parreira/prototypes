import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { AiAgentOnboarding } from 'pages/aiAgent/Onboarding_V2/components/AiAgentOnboarding/AiAgentOnboarding'
import { AiAgentOnboardingV3 } from 'pages/aiAgent/Onboarding_V3/components/AiAgentOnboarding/AiAgentOnboarding'

export const AiAgentOnboardingRouter = () => {
    const { value: isAiAgentOnboardingV3Enabled, isLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentOnboardingV3, false)

    if (isLoading) return null

    return isAiAgentOnboardingV3Enabled ? (
        <AiAgentOnboardingV3 />
    ) : (
        <AiAgentOnboarding />
    )
}
