import {
    FeatureFlagKey,
    useAreFlagsLoading,
    useFlag,
} from '@repo/feature-flags'
import { Redirect, useParams } from 'react-router-dom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { WizardStepEnum as WizardStepEnumV2 } from 'pages/aiAgent/Onboarding_V2/types'

/**
 * TEMPORARY: This component exists to support both V1 and V2 onboarding flows during migration.
 * It provides dynamic redirect logic based on feature flags.
 *
 * When users navigate to the onboarding base URL without a step parameter (e.g., from notifications,
 * navbar "Get Started" link, or bookmarks), this component determines the appropriate starting step:
 * - V1 flow: Redirects to CHANNELS step
 * - V2 flow: Redirects to TONE_OF_VOICE step
 *
 * @todo Remove this component when V1 onboarding is fully deprecated
 * @see https://linear.app/gorgias/issue/CRMGROW-2521/remove-old-onboarding-folder-and-feature-flag-when-new-flow-is
 */
export const AiAgentOnboardingRedirect = () => {
    const { shopName } = useParams<{ shopType: string; shopName: string }>()
    const isSimplifiedAiAgentOnboardingEnabled = useFlag(
        FeatureFlagKey.SimplifyAIAgentOnboardingWizard,
    )
    const areFlagsLoading = useAreFlagsLoading()
    const aiAgentNavigation = useAiAgentNavigation({ shopName })

    if (areFlagsLoading) {
        return null
    }

    const targetStep = isSimplifiedAiAgentOnboardingEnabled
        ? WizardStepEnumV2.TONE_OF_VOICE
        : WizardStepEnum.CHANNELS

    return (
        <Redirect
            to={aiAgentNavigation.routes.onboardingWizardStep(targetStep)}
        />
    )
}
