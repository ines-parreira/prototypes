import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Overlay } from '@gorgias/axiom'

import { AiAgentOnboarding } from 'pages/aiAgent/Onboarding_V2/components/AiAgentOnboarding/AiAgentOnboarding'

export const AiAgentOnboardingRouter = () => {
    const { value: isAiAgentOnboardingV3Enabled, isLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentOnboardingV3, false)

    if (isLoading) return null

    if (isAiAgentOnboardingV3Enabled) {
        return (
            <Overlay isOpen isDismissable={false}>
                <AiAgentOnboarding />
            </Overlay>
        )
    }

    return <AiAgentOnboarding />
}
