import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'

import { toHex } from 'color2k'

import { GORGIAS_CHAT_DEFAULT_COLOR } from 'config/integrations/gorgias_chat'
import type { LANGUAGE } from 'constants/languages'
import type { GorgiasChatPosition } from 'models/integration/types'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatAvatarType,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatLauncherSettings,
    GorgiasChatPreviewOrdersOptions,
    GorgiasChatPreviewSelfServiceFlows,
    GorgiasChatWorkflowEntrypoint,
} from 'models/integration/types/gorgiasChat'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../ChatPreviewPanel'
import type {
    ChatPreviewPage,
    ChatPreviewPageOptions,
    ChatPreviewPanelHandle,
    SimulateConversationMessage,
} from '../ChatPreviewPanel'

export type ChatPreviewPanelContextValue = Omit<
    ReturnType<typeof useChatPreviewPanel>,
    'showPreviewPanel' | 'hidePreviewPanel' | 'chatPreviewPortal'
>

export const ChatPreviewPanelContext =
    createContext<ChatPreviewPanelContextValue | null>(null)

export const useChatPreviewPanelContext = (): ChatPreviewPanelContextValue => {
    const context = useContext(ChatPreviewPanelContext)
    if (!context) {
        throw new Error(
            'useChatPreviewPanelContext must be used within ChatPreviewPanelContext',
        )
    }
    return context
}

type UseChatPreviewPanelOptions = {
    headerActions?: ReactNode
    showBusinessHoursToggle?: boolean
    locale?: LANGUAGE
    shouldShowChatVersionSwitcher?: boolean
}

export const useChatPreviewPanel = ({
    headerActions,
    showBusinessHoursToggle,
    locale,
    shouldShowChatVersionSwitcher = false,
}: UseChatPreviewPanelOptions = {}) => {
    const { setIsCollapsibleColumnOpen, warpToCollapsibleColumn } =
        useCollapsibleColumn()

    const [appId, setAppId] = useState<string | null>(null)
    const chatPreviewPanelRef = useRef<ChatPreviewPanelHandle>(null)
    const loadSubscribersRef = useRef<Set<() => void>>(new Set())

    const handlePreviewLoaded = useCallback(() => {
        loadSubscribersRef.current.forEach((callback) => callback())
    }, [])

    /**
     * Subscribes to the chat preview loaded event.
     *
     * @param callback - Called when the chat preview iframe finishes loading.
     * @param fireIfAlreadyLoaded - When `true`, fires `callback` immediately if
     *   the preview is already loaded, then subscribes for future reloads.
     * @returns A cleanup function that unsubscribes the callback.
     */
    const onChatPreviewLoaded = useCallback(
        (callback: () => void, fireIfAlreadyLoaded?: boolean) => {
            if (fireIfAlreadyLoaded && chatPreviewPanelRef.current?.isLoaded) {
                callback()
            }
            loadSubscribersRef.current.add(callback)
            return () => {
                loadSubscribersRef.current.delete(callback)
            }
        },
        [],
    )

    const chatPreviewPortal = warpToCollapsibleColumn(
        <ChatPreviewPanel
            ref={chatPreviewPanelRef}
            appId={appId}
            headerActions={headerActions}
            showBusinessHoursToggle={showBusinessHoursToggle}
            locale={locale}
            onPreviewLoaded={handlePreviewLoaded}
            shouldShowChatVersionSwitcher={shouldShowChatVersionSwitcher}
        />,
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

    const displayPage = useCallback(
        (page: ChatPreviewPage, options?: ChatPreviewPageOptions) => {
            chatPreviewPanelRef.current?.displayPage(page, options)
        },
        [],
    )

    const updateMainColor = useCallback(
        (color: string) => {
            let normalizedColor = color

            try {
                normalizedColor = toHex(color)
            } catch {
                normalizedColor = GORGIAS_CHAT_DEFAULT_COLOR
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

    const updateConversationColor = useCallback(
        (color: string) => {
            let normalizedColor = color

            try {
                normalizedColor = toHex(color)
            } catch {
                normalizedColor = GORGIAS_CHAT_DEFAULT_COLOR
            }

            chatPreviewPanelRef.current?.updateSettings({
                decoration: {
                    conversationColor: normalizedColor,
                },
            })
            displayPage('conversation')
            openChat()
        },
        [openChat, displayPage],
    )

    const updateBackgroundStyle = useCallback(
        (backgroundColorStyle: GorgiasChatBackgroundColorStyle) => {
            chatPreviewPanelRef.current?.updateSettings({
                decoration: {
                    backgroundColorStyle,
                },
            })
            displayPage('homepage')
            openChat()
        },
        [displayPage, openChat],
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

    const updateHeaderAlternativePictureUrl = useCallback(
        (imageUrl: string | undefined) => {
            chatPreviewPanelRef.current?.updateSettings({
                decoration: { headerAlternativePictureUrl: imageUrl },
            })
            displayPage('homepage')
            openChat()
        },
        [displayPage, openChat],
    )

    const updateIntroductionText = useCallback((introductionText: string) => {
        chatPreviewPanelRef.current?.updatePreviewTexts({
            introductionText,
        })
    }, [])

    const updateOfflineIntroductionText = useCallback(
        (offlineIntroductionText: string) => {
            chatPreviewPanelRef.current?.updatePreviewTexts({
                offlineIntroductionText,
            })
        },
        [],
    )

    const updateTexts = useCallback((texts: Record<string, string>) => {
        chatPreviewPanelRef.current?.updateTexts(texts)
    }, [])

    const updatePreviewTexts = useCallback((texts: Record<string, string>) => {
        chatPreviewPanelRef.current?.updatePreviewTexts(texts)
    }, [])

    const updateSSPTexts = useCallback((texts: Record<string, string>) => {
        chatPreviewPanelRef.current?.updateSSPTexts(texts)
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

    const updateWorkflowEntryPoints = useCallback(
        (workflowEntryPoints: GorgiasChatWorkflowEntrypoint[]) => {
            displayPage('homepage')
            chatPreviewPanelRef.current?.updateWorkflowEntryPoints(
                workflowEntryPoints,
            )
        },
        [displayPage],
    )

    const updateOrderManagementFlows = useCallback(
        (flows: GorgiasChatPreviewSelfServiceFlows) => {
            chatPreviewPanelRef.current?.updateOrderManagementFlows(flows)
        },
        [],
    )

    const reloadPreview = useCallback(() => {
        chatPreviewPanelRef.current?.reloadPreview()
    }, [])

    const updatePreviewOrders = useCallback(
        (options: GorgiasChatPreviewOrdersOptions) => {
            chatPreviewPanelRef.current?.updatePreviewOrders(options)
        },
        [],
    )

    const updateAvatarSettings = useCallback(
        (avatarSettings: {
            avatarTeamPictureUrl?: string
            avatarType?: GorgiasChatAvatarType
            avatar?: GorgiasChatAvatarSettings | null
        }) => {
            openChat()
            displayPage('conversation')

            chatPreviewPanelRef.current?.updateSettings({
                decoration: {
                    ...avatarSettings,
                },
            })
        },
        [openChat, displayPage],
    )

    const updateQuickReplies = useCallback(
        (quickReplies: { enabled: boolean; replies: string[] }) => {
            openChat()
            chatPreviewPanelRef.current?.updateSettings({ quickReplies })
        },
        [openChat],
    )

    const updateControlTicketVolume = useCallback(
        (controlTicketVolume: boolean) => {
            openChat()
            displayPage('homepage')

            chatPreviewPanelRef.current?.updateSettings({
                preferences: { controlTicketVolume },
            })
        },
        [openChat, displayPage],
    )

    const setConversationMessages = useCallback(
        (messages: SimulateConversationMessage[]) => {
            chatPreviewPanelRef.current?.setConversationMessages(messages)
        },
        [],
    )

    return {
        chatPreviewPortal,
        showPreviewPanel,
        hidePreviewPanel,
        onChatPreviewLoaded,
        openChat,
        closeChat,
        displayPage,
        updateMainColor,
        updateConversationColor,
        updateBackgroundStyle,
        updatePosition,
        updateHeaderPictureUrl,
        updateHeaderAlternativePictureUrl,
        updateIntroductionText,
        updateOfflineIntroductionText,
        updateLauncher,
        updateTexts,
        updatePreviewTexts,
        updateSSPTexts,
        updateLegalDisclaimer,
        updateLegalDisclaimerEnabled,
        updateWorkflowEntryPoints,
        updateOrderManagementFlows,
        reloadPreview,
        updateAvatarSettings,
        updateQuickReplies,
        updatePreviewOrders,
        setConversationMessages,
        updateControlTicketVolume,
    }
}
