import React from 'react'

import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

export const SkillsetStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
            >
                <span>REPLACE ME LATER</span>
                <h1>What are you looking to achieve with your AI agent?</h1>
                <p>
                    Select the primary goal you want to achieve with your AI
                    agent.
                </p>
                <div>
                    <button>Support customers</button>
                    <button>Automate repetitive tasks</button>
                    <button>Generate leads</button>
                    <button>Other</button>
                </div>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={true} icon={''}>
                <div>
                    <h2>Preview</h2>
                    <div>
                        <p>Hi, I'm Gorgias. How can I help you today?</p>
                    </div>
                </div>
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
