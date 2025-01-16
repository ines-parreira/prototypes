import React from 'react'

import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

export const ShopifyIntegrationStep: React.FC<StepProps> = ({
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
                SHOPIFY INTEGRATION STEP
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={true} icon={''}>
                SHOPIFY INTEGRATION STEP PREVIEW
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
