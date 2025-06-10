import { useMemo } from 'react'

import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'

export const useSteps = ({
    shopName,
    isStoreSelected = false,
}: {
    shopName: string
    isStoreSelected?: boolean
}) => {
    const { integration } = useShopifyIntegrationAndScope(shopName)
    const { emailIntegrations, defaultIntegration } = useEmailIntegrations()
    const scopes = useAiAgentScopesForAutomationPlan()

    // Step configuration array
    const steps = useMemo(
        () => [
            {
                step: WizardStepEnum.SHOPIFY_INTEGRATION,
                condition: isStoreSelected || !integration,
            },
            {
                step: WizardStepEnum.EMAIL_INTEGRATION,
                condition: !emailIntegrations && !defaultIntegration,
            },
            {
                step: WizardStepEnum.CHANNELS,
                condition: true,
            },
            {
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: scopes.includes(AiAgentScopes.SALES),
            },
            {
                step: WizardStepEnum.PERSONALITY_PREVIEW,
                condition: true,
            },
            {
                step: WizardStepEnum.ENGAGEMENT,
                condition: scopes.includes(AiAgentScopes.SALES),
            },
            {
                step: WizardStepEnum.HANDOVER,
                condition: false, // TODO: Put it to true when ready to show
            },
            {
                step: WizardStepEnum.KNOWLEDGE,
                condition: true,
            },
        ],
        [
            integration,
            emailIntegrations,
            defaultIntegration,
            isStoreSelected,
            scopes,
        ],
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
