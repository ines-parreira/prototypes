import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import gorgiasLogo from 'assets/img/icons/logo.png'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarType,
} from 'models/integration/types/gorgiasChat'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { toneOfVoiceConversations } from 'pages/aiAgent/Onboarding_V2/constants/conversationExamples'
import type { ChatPreviewPanelHandle } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/ChatPreviewPanel'
import { ChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/ChatPreviewPanel'

import css from './ToneOfVoicePreviewSection.less'

type ToneOfVoicePreviewSectionProps = {
    appId?: string | null
    toneOfVoice: ToneOfVoice
    latestCustomToneOfVoicePreview?: string
    isCustomToneOfVoicePreviewLoading: boolean
}

export const ToneOfVoicePreviewSection = ({
    appId,
    toneOfVoice,
    latestCustomToneOfVoicePreview,
    isCustomToneOfVoicePreviewLoading,
}: ToneOfVoicePreviewSectionProps) => {
    const panelRef = useRef<ChatPreviewPanelHandle>(null)
    const isInitialLoad = useRef(true)
    const [isLoaded, setIsLoaded] = useState(false)

    const previewMessages = useMemo(() => {
        if (
            toneOfVoice === ToneOfVoice.Custom &&
            latestCustomToneOfVoicePreview
        ) {
            return [
                {
                    text: "What's your return policy?",
                    isHtml: false,
                    fromAgent: false,
                    isBot: false,
                },
                {
                    text: latestCustomToneOfVoicePreview,
                    isHtml: true,
                    fromAgent: true,
                    isBot: true,
                },
            ]
        }

        return (toneOfVoiceConversations[toneOfVoice]?.messages ?? []).map(
            ({ content, isHtml, fromAgent }) => ({
                text: content,
                isHtml,
                fromAgent,
                isBot: fromAgent,
            }),
        )
    }, [toneOfVoice, latestCustomToneOfVoicePreview])

    const runSimulation = useCallback(() => {
        setIsLoaded(true)
        // The default chat preview (no connected app) loads a generic widget
        // configuration without any branding, so the header and conversation
        // avatar are missing. Inject the Gorgias logo as the company logo so
        // the tone-of-voice preview shows branding in the header and bubbles.
        panelRef.current?.updateSettings({
            decoration: {
                headerPictureUrl: gorgiasLogo,
                avatarType: GorgiasChatAvatarType.TEAM_PICTURE,
                avatarTeamPictureUrl: gorgiasLogo,
                avatar: {
                    imageType: GorgiasChatAvatarImageType.COMPANY_LOGO,
                    nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                    companyLogoUrl: gorgiasLogo,
                },
            },
        })
        if (isCustomToneOfVoicePreviewLoading) return
        panelRef.current?.simulateConversation(previewMessages)
    }, [previewMessages, isCustomToneOfVoicePreviewLoading])

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false
            return
        }
        panelRef.current?.simulateConversation(previewMessages)
    }, [previewMessages])

    return (
        <div className={css.previewPanel}>
            <div className={isLoaded ? css.chatWrapper : css.loadingWrapper}>
                <ChatPreviewPanel
                    withHeader={false}
                    supportDefaultChatPreview
                    forceChatRedesign
                    ref={panelRef}
                    appId={appId ?? null}
                    onPreviewLoaded={runSimulation}
                />
            </div>
        </div>
    )
}
