import {useMemo} from 'react'

import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

export const useSteps = ({shopName}: {shopName: string}) => {
    const {integration} = useShopifyIntegrationAndScope(shopName)
    const {emailIntegrations, defaultIntegration} = useEmailIntegrations()
    const {data, isLoading} = useGetOnboardingData(shopName)

    // Step configuration array
    const steps = useMemo(
        () => [
            {
                step: WizardStepEnum.SKILLSET,
                condition: true,
            },
            {
                step: WizardStepEnum.SHOPIFY_INTEGRATION,
                condition: !integration,
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
                    isLoading || data?.scopes.includes(AiAgentScopes.SALES),
            },
            {
                step: WizardStepEnum.HANDOVER,
                condition: true,
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
            data?.scopes,
            isLoading,
        ]
    )

    // Filter steps based on conditions
    const validSteps = useMemo(
        () => steps.filter((step) => step.condition),
        [steps]
    )

    const totalSteps = useMemo(() => validSteps.length, [validSteps])

    return {
        validSteps,
        totalSteps,
    }
}
