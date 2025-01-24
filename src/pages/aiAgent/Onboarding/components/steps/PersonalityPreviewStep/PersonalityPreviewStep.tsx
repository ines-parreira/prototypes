import React, {useEffect, useState} from 'react'

import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {PersonalityPreviewGroup} from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/PersonalityPreviewGroup'
import {Separator} from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'

const useMockedData = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return {
            isLoading: true,
        }
    }

    return {
        isLoading: false,
        data: {
            previewType: 'mixed' as const,
        },
    }
}

export const PersonalityPreviewStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    const {data, isLoading} = useMockedData()
    const [selectedPreview, setSelectedPreview] = useState<{
        index: number
        preview: {caption: string; title: string}
    }>()
    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
            >
                <MainTitle
                    titleBlack="Now see how your AI Agent will respond to"
                    titleMagenta=" your customers"
                />
                <Separator />
                <AIBanner fillStyle="fill">
                    Preview AI Agent’s personality, crafted using your brand’s
                    tone of voice from your website. Fine-tune it anytime in
                    your Settings.
                </AIBanner>
                <Separator />
                <PersonalityPreviewGroup
                    previewType={data?.previewType}
                    isLoading={isLoading}
                    selectedPreviewIndex={selectedPreview?.index ?? 0}
                    onPreviewSelect={({title, caption}, index) =>
                        setSelectedPreview({
                            index,
                            preview: {title, caption},
                        })
                    }
                />
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={isLoading} icon={''}>
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
