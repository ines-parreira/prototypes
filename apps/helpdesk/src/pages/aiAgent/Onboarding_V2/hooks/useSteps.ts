import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

export const useSteps = ({
    shopName,
    isStoreSelected = false,
}: {
    shopName: string
    isStoreSelected?: boolean
}) => {
    const { integration } = useShopifyIntegrationAndScope(shopName)
    const scopes = useAiAgentScopesForAutomationPlan(shopName)
    const handoverEnabled = useFlag(
        FeatureFlagKey.StandaloneHandoverCapabilities,
    )

    // Step configuration array
    const steps = useMemo(
        () => [
            {
                step: WizardStepEnum.SHOPIFY_INTEGRATION,
                condition: isStoreSelected || !integration,
            },
            {
                step: WizardStepEnum.TONE_OF_VOICE,
                condition: true,
            },
            {
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: scopes.includes(AiAgentScopes.SALES),
            },
            {
                step: WizardStepEnum.ENGAGEMENT,
                condition: scopes.includes(AiAgentScopes.SALES),
            },
            {
                step: WizardStepEnum.HANDOVER,
                condition: handoverEnabled,
            },
            {
                step: WizardStepEnum.PERSONALITY_PREVIEW,
                condition: true,
            },
            {
                step: WizardStepEnum.KNOWLEDGE,
                condition: true,
            },
        ],
        [integration, isStoreSelected, scopes, handoverEnabled],
    )

    // Filter steps based on conditions
    const validSteps = useMemo(
        () => steps.filter((step) => step.condition),
        [steps],
    )

    const totalSteps = useMemo(() => validSteps.length, [validSteps])

    return {
        validSteps,
        totalSteps,
    }
}
