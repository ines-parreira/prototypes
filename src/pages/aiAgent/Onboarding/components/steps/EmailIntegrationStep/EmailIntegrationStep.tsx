import React, {FC} from 'react'

import {useParams} from 'react-router-dom'

import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    OnboardingBody,
    OnboardingContentContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'

const EmailIntegrationStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    setCurrentStep,
}) => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {integration} = useShopifyIntegrationAndScope(shopName)

    const onNextClick = () => {
        setCurrentStep?.(WizardStepEnum.CHANNELS)
    }

    const onBackClick = () => {
        if (!integration) {
            setCurrentStep?.(WizardStepEnum.SHOPIFY_INTEGRATION)
            return
        }
        setCurrentStep?.(WizardStepEnum.SKILLSET)
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
