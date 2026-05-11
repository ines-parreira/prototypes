import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useLocation } from 'react-router-dom'

import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import { parseJtbdParam } from 'pages/aiAgent/utils/jtbd'
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
    const { value: handoverEnabled } = useFlagWithLoading(
        FeatureFlagKey.StandaloneHandoverCapabilities,
        false,
    )
    const { value: isV3OnboardingEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentOnboardingV3,
        false,
    )
    const { search } = useLocation()

    const includeSalesSteps = useMemo(() => {
        const jtbd = isV3OnboardingEnabled ? parseJtbdParam(search) : undefined

        if (jtbd != null) {
            return jtbd === AiAgentScopes.SALES
        }

        return scopes.includes(AiAgentScopes.SALES)
    }, [isV3OnboardingEnabled, search, scopes])

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
                condition: includeSalesSteps,
            },
            {
                step: WizardStepEnum.ENGAGEMENT,
                condition: includeSalesSteps,
            },
            {
                step: WizardStepEnum.HANDOVER,
                condition: handoverEnabled,
            },
            {
                step: WizardStepEnum.KNOWLEDGE,
                condition: true,
            },
        ],
        [integration, isStoreSelected, includeSalesSteps, handoverEnabled],
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
