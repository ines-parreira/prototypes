import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'

import { toHex } from 'color2k'

import type { Language } from 'constants/languages'
import type { GorgiasChatPosition } from 'models/integration/types'
import type {
    GorgiasChatLauncherSettings,
    GorgiasChatWorkflowEntrypoint,
} from 'models/integration/types/gorgiasChat'
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

    const showPreviewPanel = useCallback(
        (appId: string | null) => {
            setAppId(appId)
            setIsCollapsibleColumnOpen(true)
        },
        [setIsCollapsibleColumnOpen],
    )

    const hidePreviewPanel = useCallback(() => {
        setIsCollapsibleColumnOpen(false)
    }, [setIsCollapsibleColumnOpen])

    useEffect(() => {
        return () => {
            setIsCollapsibleColumnOpen(false)
        }
    }, [setIsCollapsibleColumnOpen])

    const closeChat = useCallback(() => {
        chatPreviewPanelRef.current?.closeChat()
    }, [])

    const openChat = useCallback(() => {
        chatPreviewPanelRef.current?.openChat()
    }, [])

    const displayPage = useCallback((page: 'homepage' | 'conversation') => {
        chatPreviewPanelRef.current?.displayPage(page)
    }, [])

    const updateMainColor = useCallback(
        (color: string) => {
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
        },
        [openChat],
    )

    const updatePosition = useCallback(
        (position: GorgiasChatPosition) => {
            closeChat()
            chatPreviewPanelRef.current?.updatePosition(position)
        },
        [closeChat],
    )

    const updateHeaderPictureUrl = useCallback(
        (imageUrl: string | undefined) => {
            chatPreviewPanelRef.current?.updateSettings({
                decoration: { headerPictureUrl: imageUrl },
            })
            displayPage('homepage')
            openChat()
        },
        [displayPage, openChat],
    )

    const updateTexts = useCallback((texts: Record<string, string>) => {
        chatPreviewPanelRef.current?.updateTexts(texts)
    }, [])

    const updateLauncher = useCallback(
        (settings: GorgiasChatLauncherSettings) => {
            chatPreviewPanelRef.current?.updateSettings({
                decoration: { launcher: settings },
            })
            closeChat()
        },
        [closeChat],
    )

    const updateLegalDisclaimer = useCallback(
        (privacyPolicyDisclaimer: string) => {
            chatPreviewPanelRef.current?.updateTexts({
                privacyPolicyDisclaimer,
            })
        },
        [],
    )

    const updateLegalDisclaimerEnabled = useCallback((enabled: boolean) => {
        chatPreviewPanelRef.current?.updateSettings({
            preferences: { privacyPolicyDisclaimerEnabled: enabled },
        })
    }, [])

    const updateLanguage = useCallback(async (language: Language) => {
        await chatPreviewPanelRef.current?.updateLanguage(language)
    }, [])

    const updateWorkflowEntryPoints = useCallback(
        (workflowEntryPoints: GorgiasChatWorkflowEntrypoint[]) => {
            displayPage('homepage')
            chatPreviewPanelRef.current?.updateWorkflowEntryPoints(
                workflowEntryPoints,
            )
        },
        [displayPage],
    )

    const reloadPreview = useCallback(() => {
        chatPreviewPanelRef.current?.reloadPreview()
    }, [])

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
        updateWorkflowEntryPoints,
        reloadPreview,
    }
}
