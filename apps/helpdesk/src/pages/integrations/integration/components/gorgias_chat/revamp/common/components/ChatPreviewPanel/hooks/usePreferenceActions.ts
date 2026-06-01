import type { RefObject } from 'react'
import { useCallback } from 'react'

import type {
    GorgiasChatAutoResponderReply,
    GorgiasChatEmailCaptureType,
} from 'models/integration/types/gorgiasChat'

import type {
    ChatPreviewPage,
    ChatPreviewPageOptions,
    ChatPreviewPanelHandle,
} from '../ChatPreviewPanel'

type Controls = {
    openChat: () => void
    displayPage: (
        page: ChatPreviewPage,
        options?: ChatPreviewPageOptions,
    ) => void
}

export const usePreferenceActions = (
    panelRef: RefObject<ChatPreviewPanelHandle>,
    { openChat, displayPage }: Controls,
) => {
    const updateLegalDisclaimerEnabled = useCallback(
        (enabled: boolean) => {
            panelRef.current?.updateSettings({
                preferences: { privacyPolicyDisclaimerEnabled: enabled },
            })
        },
        [panelRef],
    )

    const updateControlTicketVolume = useCallback(
        (controlTicketVolume: boolean) => {
            openChat()
            displayPage('homepage')

            panelRef.current?.updateSettings({
                preferences: { controlTicketVolume },
            })
        },
        [panelRef, openChat, displayPage],
    )

    const updateQuickReplies = useCallback(
        (quickReplies: { enabled: boolean; replies: string[] }) => {
            openChat()
            panelRef.current?.updateSettings({ quickReplies })
        },
        [panelRef, openChat],
    )

    const updateEmailCaptureSettings = useCallback(
        (settings: {
            emailCaptureEnabled?: boolean
            emailCaptureEnforcement?: GorgiasChatEmailCaptureType
        }) => {
            panelRef.current?.updateSettings({ preferences: settings })
        },
        [panelRef],
    )

    const updateAutoResponderSettings = useCallback(
        (settings: {
            enabled?: boolean
            reply?: GorgiasChatAutoResponderReply
        }) => {
            panelRef.current?.updateSettings({
                preferences: { autoResponder: settings },
            })
        },
        [panelRef],
    )

    return {
        updateLegalDisclaimerEnabled,
        updateControlTicketVolume,
        updateQuickReplies,
        updateEmailCaptureSettings,
        updateAutoResponderSettings,
    }
}
