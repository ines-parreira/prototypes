import { useMemo } from 'react'

import { StoreIntegration } from 'models/integration/types'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'

export const useSteps = ({
    shopName,
    selectedScope = [],
}: {
    shopName: string
    selectedScope?: AiAgentScopes[]
}) => {
    const { integration } = useShopifyIntegrationAndScope(shopName)
    const shopifyIntegrations: StoreIntegration[] = useShopifyIntegrations()
    const { emailIntegrations, defaultIntegration } = useEmailIntegrations()
    const { data, isLoading } = useGetOnboardingData(shopName)

    // Step configuration array
    const steps = useMemo(
        () => [
            {
                step: WizardStepEnum.SKILLSET,
                condition: true,
            },
            {
                step: WizardStepEnum.SHOPIFY_INTEGRATION,
                condition: shopifyIntegrations.length > 1 || !integration,
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
                step: WizardStepEnum.PERSONALITY_PREVIEW,
                condition: true,
            },
            {
                step: WizardStepEnum.SALES_PERSONALITY,
                condition:
                    isLoading ||
                    (data?.scopes.includes(AiAgentScopes.SALES) &&
                        (selectedScope?.includes(AiAgentScopes.SALES) ||
                            selectedScope.length === 0)) ||
                    selectedScope?.includes(AiAgentScopes.SALES),
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
            shopifyIntegrations.length,
            integration,
            emailIntegrations,
            defaultIntegration,
            data?.scopes,
            isLoading,
            selectedScope,
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
