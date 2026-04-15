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

import type { LANGUAGE } from 'constants/languages'
import type { GorgiasChatPosition } from 'models/integration/types'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatAvatarType,
    GorgiasChatLauncherSettings,
    GorgiasChatPreviewOrdersOptions,
    GorgiasChatWorkflowEntrypoint,
} from 'models/integration/types/gorgiasChat'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../ChatPreviewPanel'
import type {
    ChatPreviewPage,
    ChatPreviewPanelHandle,
    SimulateConversationMessage,
} from '../ChatPreviewPanel'

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

type UseChatPreviewPanelOptions = {
    headerActions?: ReactNode
    locale?: LANGUAGE
    initialPage?: ChatPreviewPage
    previewOrders?: GorgiasChatPreviewOrdersOptions
}

export const useChatPreviewPanel = ({
    headerActions,
    locale,
    initialPage,
    previewOrders,
}: UseChatPreviewPanelOptions = {}) => {
    const { setIsCollapsibleColumnOpen, warpToCollapsibleColumn } =
        useCollapsibleColumn()

    const [appId, setAppId] = useState<string | null>(null)
    const chatPreviewPanelRef = useRef<ChatPreviewPanelHandle>(null)
    const pendingConversationMessages = useRef<
        SimulateConversationMessage[] | null
    >(null)
    const pendingQuickReplies = useRef<{
        enabled: boolean
        replies: string[]
    } | null>(null)

    const onChatLoaded = useCallback(() => {
        if (pendingConversationMessages.current) {
            chatPreviewPanelRef.current?.setConversationMessages(
                pendingConversationMessages.current,
            )
        }
        if (pendingQuickReplies.current) {
            chatPreviewPanelRef.current?.updateSettings({
                quickReplies: pendingQuickReplies.current,
            })
        }
    }, [])

    const chatPreviewPortal = warpToCollapsibleColumn(
        <ChatPreviewPanel
            ref={chatPreviewPanelRef}
            appId={appId}
            headerActions={headerActions}
            locale={locale}
            initialPage={initialPage}
            previewOrders={previewOrders}
            onChatLoaded={onChatLoaded}
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

    const displayPage = useCallback((page: ChatPreviewPage) => {
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
            pendingQuickReplies.current = quickReplies
            openChat()
            chatPreviewPanelRef.current?.updateSettings({ quickReplies })
        },
        [openChat],
    )

    const setConversationMessages = useCallback(
        (messages: SimulateConversationMessage[]) => {
            pendingConversationMessages.current = messages
            chatPreviewPanelRef.current?.setConversationMessages(messages)
        },
        [],
    )

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
        updateWorkflowEntryPoints,
        reloadPreview,
        updateAvatarSettings,
        updateQuickReplies,
        updatePreviewOrders,
        setConversationMessages,
    }
}
