import React, {FC} from 'react'

import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {
    OnboardingBody,
    OnboardingContentContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'

export const EmailIntegrationStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const {data, isLoading} = useGetOnboardingData()
    const storeName = data?.shop || ''

    const {integration} = useShopifyIntegrationAndScope(storeName)

    useCheckStoreIntegration({storeName, isLoading, goToStep})

    const onNextClick = () => {
        goToStep(WizardStepEnum.CHANNELS)
    }

    const onBackClick = () => {
        if (!integration) {
            goToStep(WizardStepEnum.SHOPIFY_INTEGRATION)
            return
        }
        goToStep(WizardStepEnum.SKILLSET)
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
            >
                <div>Email Integration step</div>
            </OnboardingContentContainer>
        </OnboardingBody>
    )
}

export default EmailIntegrationStep
