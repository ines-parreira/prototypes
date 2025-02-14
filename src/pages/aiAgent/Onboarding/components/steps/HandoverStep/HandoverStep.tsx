import React, {FC} from 'react'

import {useParams} from 'react-router-dom'

import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {
    OnboardingBody,
    OnboardingContentContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

export const HandoverStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const {shopName} = useParams<{shopName: string}>()

    const {data} = useGetOnboardingData(shopName)

    useCheckStoreIntegration()

    const onNextClick = () => {
        goToStep(WizardStepEnum.KNOWLEDGE)
    }

    const onBackClick = () => {
        if (data?.scopes.includes(AiAgentScopes.SALES)) {
            goToStep(WizardStepEnum.SALES_PERSONALITY)
            return
        }

        goToStep(WizardStepEnum.PERSONALITY_PREVIEW)
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
            >
                <div>Handover step</div>
            </OnboardingContentContainer>
        </OnboardingBody>
    )
}

export default HandoverStep
