import React, {useEffect, useState} from 'react'

import {useParams} from 'react-router-dom'

import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {
    getFirstPreviewForPreviewType,
    PreviewId,
} from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import {PersonalityPreviewGroup} from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/PersonalityPreviewGroup'
import {Separator} from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import {useFetchPersonalityPreviewChatScenario} from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/mockedHooks'
import css from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep.less'
import {mapScopeToPreviewType} from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/PersonalityPreviewStep.utils'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {useSteps} from 'pages/aiAgent/Onboarding/hooks/useSteps'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

export const PersonalityPreviewStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const {shopName} = useParams<{shopName: string}>()

    const {validSteps} = useSteps({shopName})

    const {data, isLoading} = useGetOnboardingData(shopName)

    useCheckStoreIntegration()

    const previewType = mapScopeToPreviewType(data?.scopes ?? [])

    const [selectedPreview, setSelectedPreview] = useState<{
        caption: string
        title: string
        id: PreviewId
    }>()

    // Select first preview automatically when loaded
    useEffect(() => {
        if (selectedPreview) {
            return
        }

        setSelectedPreview(getFirstPreviewForPreviewType(previewType))
    }, [previewType, selectedPreview])

    const {data: chatPreviewData, isLoading: isChatPreviewLoading} =
        useFetchPersonalityPreviewChatScenario(previewType, selectedPreview?.id)

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
                    previewType={previewType}
                    selectedPreviewId={selectedPreview?.id}
                    onPreviewSelect={(preview) => setSelectedPreview(preview)}
                />
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading={isChatPreviewLoading || isLoading}
                icon={''}
                caption="Here’s a sample conversation with your AI Agent, reflecting your brand’s tone. You can adjust its personality in Settings anytime."
            >
                <div className={css.previewContainer}>
                    <div>
                        <ChatIntegrationPreview {...chatPreviewSettings}>
                            <AiAgentChatConversation
                                {...agentChatConversationSettings}
                                messages={chatPreviewData.messages}
                                removeLinksFromMessages
                            />
                        </ChatIntegrationPreview>
                    </div>
                </div>
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
