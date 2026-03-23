import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { toHex } from 'color2k'

import type { Language } from 'constants/languages'
import type { GorgiasChatPosition } from 'models/integration/types'
import type { GorgiasChatLauncherSettings } from 'models/integration/types/gorgiasChat'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../ChatPreviewPanel'
import type { ChatPreviewPanelHandle } from '../ChatPreviewPanel'

export type ChatPreviewPanelContextValue = Omit<
    ReturnType<typeof useChatPreviewPanel>,
    'showPreviewPanel' | 'hidePreviewPanel' | 'chatPreviewPortal'
>

export const ChatPreviewPanelContext =
    createContext<ChatPreviewPanelContextValue | null>(null)

export const useGorgiasChatCreationWizardContext =
    (): ChatPreviewPanelContextValue => {
        const context = useContext(ChatPreviewPanelContext)
        if (!context) {
            throw new Error(
                'useGorgiasChatCreationWizardContext must be used within GorgiasChatCreationWizard',
            )
        }
        return context
    }

export const useChatPreviewPanel = () => {
    const { setIsCollapsibleColumnOpen, warpToCollapsibleColumn } =
        useCollapsibleColumn()

    const [appId, setAppId] = useState<string | null>(null)
    const chatPreviewPanelRef = useRef<ChatPreviewPanelHandle>(null)

    const chatPreviewPortal = warpToCollapsibleColumn(
        <ChatPreviewPanel ref={chatPreviewPanelRef} appId={appId} />,
    )

    const showPreviewPanel = (appId: string | null) => {
        setAppId(appId)
        setIsCollapsibleColumnOpen(true)
    }

    const hidePreviewPanel = () => {
        setIsCollapsibleColumnOpen(false)
    }

    useEffect(() => {
        return () => {
            setIsCollapsibleColumnOpen(false)
        }
    }, [setIsCollapsibleColumnOpen])

    const closeChat = () => {
        chatPreviewPanelRef.current?.closeChat()
    }

    const openChat = () => {
        chatPreviewPanelRef.current?.openChat()
    }

    const displayPage = (page: 'homepage' | 'conversation') => {
        chatPreviewPanelRef.current?.displayPage(page)
    }

    const updateMainColor = (color: string) => {
        let normalizedColor = color

        try {
            normalizedColor = toHex(color)
        } catch {
            normalizedColor = '#808080'
        }

        chatPreviewPanelRef.current?.updateSettings({
            decoration: {
                mainColor: normalizedColor,
            },
        })
        openChat()
    }

    const updatePosition = (position: GorgiasChatPosition) => {
        closeChat()
        chatPreviewPanelRef.current?.updatePosition(position)
    }

    const updateHeaderPictureUrl = (imageUrl: string | undefined) => {
        chatPreviewPanelRef.current?.updateSettings({
            decoration: { headerPictureUrl: imageUrl },
        })
        displayPage('homepage')
        openChat()
    }

    const updateTexts = (texts: Record<string, string>) => {
        chatPreviewPanelRef.current?.updateTexts(texts)
    }

    const updateLauncher = (settings: GorgiasChatLauncherSettings) => {
        chatPreviewPanelRef.current?.updateSettings({
            decoration: { launcher: settings },
        })
        closeChat()
    }

    const updateLegalDisclaimer = (privacyPolicyDisclaimer: string) => {
        chatPreviewPanelRef.current?.updateTexts({ privacyPolicyDisclaimer })
    }

    const updateLegalDisclaimerEnabled = (enabled: boolean) => {
        chatPreviewPanelRef.current?.updateSettings({
            preferences: { privacyPolicyDisclaimerEnabled: enabled },
        })
    }

    const updateLanguage = async (language: Language) => {
        await chatPreviewPanelRef.current?.updateLanguage(language)
    }

    return {
        chatPreviewPortal,
        showPreviewPanel,
        hidePreviewPanel,
        openChat,
        closeChat,
        displayPage,
        updateMainColor,
        updatePosition,
        updateHeaderPictureUrl,
        updateLauncher,
        updateTexts,
        updateLegalDisclaimer,
        updateLegalDisclaimerEnabled,
        updateLanguage,
    }
}
