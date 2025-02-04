import React, {FC} from 'react'

import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {
    OnboardingBody,
    OnboardingContentContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

const HandoverStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    setCurrentStep,
}) => {
    const {data} = useGetOnboardingData()

    const onNextClick = () => {
        setCurrentStep?.(WizardStepEnum.KNOWLEDGE)
    }

    const onBackClick = () => {
        if (data?.scope.includes(AiAgentScopes.SALES)) {
            setCurrentStep?.(WizardStepEnum.SALES_PERSONALITY)
            return
        }

        setCurrentStep?.(WizardStepEnum.PERSONALITY_PREVIEW)
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
