import type { FC } from 'react'

import { useParams } from 'react-router-dom'

import MainTitle from 'pages/aiAgent/Onboarding_V2/components/MainTitle/MainTitle'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'

export const ToneOfVoiceStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const { shopName } = useParams<{ shopName: string }>()
    const { validSteps } = useSteps({ shopName, isStoreSelected })
    const isFirstStep = currentStep === 1

    useCheckStoreIntegration({ shouldCheck: !isFirstStep })
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const onNextClick = () => {
        const nextStep = validSteps[currentStep]?.step
        goToStep(nextStep)
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step
        if (previousStep) {
            goToStep(previousStep)
        }
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
            >
                <MainTitle titleBlack="Set Your" titleMagenta="Tone of Voice" />
                {/* More content will be added later */}
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading={false}
                icon={''}
                caption="Preview"
            >
                {/* Preview content will be added later */}
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
