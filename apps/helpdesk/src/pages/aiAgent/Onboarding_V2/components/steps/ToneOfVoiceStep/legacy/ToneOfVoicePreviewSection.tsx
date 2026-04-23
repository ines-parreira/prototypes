import { useMemo } from 'react'

import { Box } from '@gorgias/axiom'

import { ToneOfVoice } from 'pages/aiAgent/constants'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding_V2/components/AiAgentChatConversation/AiAgentChatConversation'
import { toneOfVoiceConversations } from 'pages/aiAgent/Onboarding_V2/constants/conversationExamples'
import { OnboardingPreviewContainer } from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding_V2/settings'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

type ToneOfVoicePreviewSectionProps = {
    toneOfVoice: ToneOfVoice
    latestCustomToneOfVoicePreview?: string
    isCustomToneOfVoicePreviewLoading: boolean
}

export const ToneOfVoicePreviewSection = ({
    toneOfVoice,
    latestCustomToneOfVoicePreview,
    isCustomToneOfVoicePreviewLoading,
}: ToneOfVoicePreviewSectionProps) => {
    const previewMessages = useMemo(() => {
        if (
            toneOfVoice === ToneOfVoice.Custom &&
            latestCustomToneOfVoicePreview
        ) {
            return [
                {
                    content: "What's your return policy?",
                    isHtml: false,
                    fromAgent: false,
                    attachments: [],
                },
                {
                    content: latestCustomToneOfVoicePreview,
                    isHtml: true,
                    fromAgent: true,
                    attachments: [],
                },
            ]
        }

        return toneOfVoiceConversations[toneOfVoice]?.messages ?? []
    }, [toneOfVoice, latestCustomToneOfVoicePreview])

    return (
        <OnboardingPreviewContainer showCaption>
            <Box justifyContent="center" width="100%">
                <ChatIntegrationPreview {...chatPreviewSettings}>
                    <AiAgentChatConversation
                        {...agentChatConversationSettings}
                        messages={previewMessages}
                        isTyping={isCustomToneOfVoicePreviewLoading}
                        removeLinksFromMessages
                    />
                </ChatIntegrationPreview>
            </Box>
        </OnboardingPreviewContainer>
    )
}
