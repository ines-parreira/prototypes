import React, {FC} from 'react'

import {useParams} from 'react-router-dom'

import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
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
    const {shopName} = useParams<{shopName: string}>()

    const {integration} = useShopifyIntegrationAndScope(shopName)

    useCheckStoreIntegration()

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
