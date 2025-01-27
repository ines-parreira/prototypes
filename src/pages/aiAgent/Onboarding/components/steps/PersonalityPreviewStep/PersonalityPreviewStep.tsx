import React, {useEffect, useState} from 'react'

import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {
    getFirstPreviewForPreviewType,
    PreviewId,
} from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import {PersonalityPreviewGroup} from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/PersonalityPreviewGroup'
import {Separator} from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {useOnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import {useFetchPersonalityPreviewChatScenario} from './mockedHooks'
import css from './PersonalityPreviewStep.less'
import {mapScopeToPreviewType} from './PersonalityPreviewStep.utils'

export const PersonalityPreviewStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    const {scope} = useOnboardingContext()
    const previewType = mapScopeToPreviewType(scope)
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
                isLoading={isChatPreviewLoading}
                icon={''}
                caption="Here’s a sample conversation with your AI Agent, reflecting your brand’s tone. You can adjust its personality in Settings anytime."
            >
                {!isChatPreviewLoading && (
                    <div className={css.previewContainer}>
                        <div>
                            {/* TODO: Having an async process to fetch chatPreviewSettings from the onboarding hook */}
                            <ChatIntegrationPreview {...chatPreviewSettings}>
                                <AiAgentChatConversation
                                    {...agentChatConversationSettings}
                                    messages={chatPreviewData.messages}
                                />
                            </ChatIntegrationPreview>
                        </div>
                    </div>
                )}
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
