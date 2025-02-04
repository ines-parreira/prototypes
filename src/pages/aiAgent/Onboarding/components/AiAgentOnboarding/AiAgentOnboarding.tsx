import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useState} from 'react'

import {Redirect, useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {ChannelsStep} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep'
import EmailIntegrationStep from 'pages/aiAgent/Onboarding/components/steps/EmailIntegrationStep/EmailIntegrationStep'
import HandoverStep from 'pages/aiAgent/Onboarding/components/steps/HandoverStep/HandoverStep'
import {KnowledgeStep} from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep'
import {PersonalityPreviewStep} from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep'
import {PersonalityStep} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersonalityStep'
import {ShopifyIntegrationStep} from 'pages/aiAgent/Onboarding/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep'
import SkillsetStep from 'pages/aiAgent/Onboarding/components/steps/SkillsetStep/SkillsetStep'
import {useSteps} from 'pages/aiAgent/Onboarding/hooks/useSteps'
import {
    ConvAiOnboardingLayout,
    OnboardingHeader,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'

const renderStep = ({
    currentStep,
    setCurrentStep,
    totalSteps,
    currentIndex,
}: {
    currentStep: WizardStepEnum
    setCurrentStep: (step: WizardStepEnum) => void
    totalSteps: number
    currentIndex: number
}) => {
    switch (currentStep) {
        case WizardStepEnum.SHOPIFY_INTEGRATION:
            return (
                <ShopifyIntegrationStep
                    currentStep={currentIndex}
                    totalSteps={totalSteps}
                    setCurrentStep={setCurrentStep}
                />
            )
        case WizardStepEnum.EMAIL_INTEGRATION:
            return (
                <EmailIntegrationStep
                    currentStep={currentIndex}
                    totalSteps={totalSteps}
                    setCurrentStep={setCurrentStep}
                />
            )
        case WizardStepEnum.CHANNELS:
            return (
                <ChannelsStep
                    currentStep={currentIndex}
                    totalSteps={totalSteps}
                    setCurrentStep={setCurrentStep}
                />
            )
        case WizardStepEnum.PERSONALITY_PREVIEW:
            return (
                <PersonalityPreviewStep
                    currentStep={currentIndex}
                    totalSteps={totalSteps}
                    setCurrentStep={setCurrentStep}
                />
            )
        case WizardStepEnum.SALES_PERSONALITY:
            return (
                <PersonalityStep
                    currentStep={currentIndex}
                    totalSteps={totalSteps}
                    setCurrentStep={setCurrentStep}
                />
            )

        case WizardStepEnum.HANDOVER:
            return (
                <HandoverStep
                    currentStep={currentIndex}
                    totalSteps={totalSteps}
                    setCurrentStep={setCurrentStep}
                />
            )
        case WizardStepEnum.KNOWLEDGE:
            return (
                <KnowledgeStep
                    currentStep={currentIndex}
                    totalSteps={totalSteps}
                    setCurrentStep={setCurrentStep}
                />
            )
        default:
            return (
                <SkillsetStep
                    currentStep={currentIndex}
                    totalSteps={totalSteps}
                    setCurrentStep={setCurrentStep}
                />
            )
    }
}

export const AiAgentOnboarding = ({
    onClose = () => {},
}: {
    onClose?: () => void
}) => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    const {validSteps, totalSteps} = useSteps({shopName})
    const {routes} = useAiAgentNavigation({shopName})

    const [currentStep, setCurrentStep] = useState<WizardStepEnum>(
        WizardStepEnum.SKILLSET
    )

    const isConvAiOnboardingEnabled =
        useFlags()[FeatureFlagKey.ConvAiOnboarding]

    if (isConvAiOnboardingEnabled === false) {
        return <Redirect to={routes.main} />
    }

    const currentIndex =
        validSteps.findIndex((step) => step.step === currentStep) + 1

    return (
        <ConvAiOnboardingLayout>
            <OnboardingHeader onClose={onClose} />
            {renderStep({
                currentStep,
                setCurrentStep,
                totalSteps,
                currentIndex,
            })}
        </ConvAiOnboardingLayout>
    )
}
