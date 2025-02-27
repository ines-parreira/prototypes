import React, { FC } from 'react'

import { useParams } from 'react-router-dom'

import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import {
    OnboardingBody,
    OnboardingContentContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

export const HandoverStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const { shopName } = useParams<{ shopName: string }>()

    const { validSteps } = useSteps({ shopName })

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()

    const onNextClick = () => {
        const nextStep = validSteps[currentStep]?.step

        goToStep(nextStep)
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
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
