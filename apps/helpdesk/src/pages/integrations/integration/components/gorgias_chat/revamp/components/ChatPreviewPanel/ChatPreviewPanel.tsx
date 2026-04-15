import type { ReactNode } from 'react'
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import type { LANGUAGE } from 'constants/languages'
import type {
    GorgiasChatPosition,
    GorgiasChatPreviewApplicationSettings,
} from 'models/integration/types'
import type {
    GorgiasChatPreviewOrdersOptions,
    GorgiasChatWorkflowEntrypoint,
} from 'models/integration/types/gorgiasChat'

import { ChatPreview } from './components/ChatPreview/ChatPreview'
import type { ChatPreviewHandle } from './components/ChatPreview/ChatPreview'

import css from './ChatPreviewPanel.less'

export type ChatPreviewPage = 'homepage' | 'conversation' | 'orders' | 'track'

export type SimulateConversationMessage = {
    text: string
    isHtml?: boolean
    fromAgent: boolean
}

export type ChatPreviewPanelHandle = {
    displayPage: (page: ChatPreviewPage) => void
    updatePosition: (position: GorgiasChatPosition) => void
    updateSettings: (settings: GorgiasChatPreviewApplicationSettings) => void
    updateTexts: (texts: Record<string, string>) => void
    closeChat: () => void
    openChat: () => void
    updateWorkflowEntryPoints: (
        workflowEntrypoints: GorgiasChatWorkflowEntrypoint[],
    ) => void
    reloadPreview: () => void
    updatePreviewOrders: (options: GorgiasChatPreviewOrdersOptions) => void
    simulateConversation: (messages: SimulateConversationMessage[]) => void
    setConversationMessages: (messages: SimulateConversationMessage[]) => void
}

type Props = {
    appId: string | null
    headerActions?: ReactNode
    locale?: LANGUAGE
    initialPage?: ChatPreviewPage
    previewOrders?: GorgiasChatPreviewOrdersOptions
    onChatLoaded?: () => void
}

export const ChatPreviewPanel = forwardRef<ChatPreviewPanelHandle, Props>(
    (
        {
            appId,
            headerActions,
            locale,
            initialPage,
            previewOrders,
            onChatLoaded,
        }: Props,
        ref,
    ) => {
        const chatPreviewRef = useRef<ChatPreviewHandle>(null)
        const [selectedPage, setSelectedPage] =
            useState<Exclude<ChatPreviewPage, 'track' | 'orders'>>('homepage')
        const previewOrdersRef = useRef(previewOrders)
        previewOrdersRef.current = previewOrders

        const [reloadKey, setReloadKey] = useState(0)
        const chatPreviewKey = useMemo(() => {
            return `${reloadKey}${locale ? '-' + locale : ''}`
        }, [reloadKey, locale])

        const withGorgiasChat = (
            callback: (
                gorgiasChat: NonNullable<Window['GorgiasChat']>,
            ) => void | Promise<void>,
        ): void | Promise<void> => {
            const ref = chatPreviewRef.current
            if (!ref?.isLoaded || ref?.hasError) return

            const gorgiasChat =
                ref.iframeRef.current?.contentWindow?.GorgiasChat
            if (!gorgiasChat) return

            try {
                const result = callback(gorgiasChat)
                if (result instanceof Promise) {
                    return result.catch((error) => {
                        if (process.env.NODE_ENV === 'development') {
                            console.error(error)
                        }
                    })
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error)
                }
            }
        }

        const displayPage = useCallback(
            (page: ChatPreviewPage) => {
                withGorgiasChat((gorgiasChat) => {
                    if (page === 'homepage' || page === 'conversation') {
                        if (page === selectedPage) return
                        setSelectedPage(page)
                    }
                    gorgiasChat.setPage(page)
                })
            },
            [selectedPage],
        )

        const closeChat = () => {
            withGorgiasChat((gorgiasChat) => gorgiasChat.close())
        }

        const openChat = () => {
            withGorgiasChat((gorgiasChat) => gorgiasChat.open())
        }

        const updatePosition = (position: GorgiasChatPosition) => {
            withGorgiasChat((gorgiasChat) => gorgiasChat.setPosition(position))
        }

        const updateSettings = (
            settings: GorgiasChatPreviewApplicationSettings,
        ) => {
            withGorgiasChat((gorgiasChat) =>
                gorgiasChat.updateSettings?.(settings),
            )
        }

        const updateTexts = (texts: Record<string, string>) => {
            withGorgiasChat(() => {
                const iframeWindow = chatPreviewRef.current?.iframeRef.current
                    ?.contentWindow as any
                /**
                 * The iframe runs in a separate JS realm, so plain objects created here fail
                 * the `instanceof Object` check inside the chat widget. We use the iframe's
                 * own Object constructor to create the target, ensuring it belongs to the correct realm.
                 */
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const iframeTexts = iframeWindow.Object.assign(
                    new iframeWindow.Object(),
                    texts,
                )
                iframeWindow.GorgiasChat?.updateTexts(iframeTexts)
            })
        }

        const updateWorkflowEntryPoints = (
            workflowEntryPoints: GorgiasChatWorkflowEntrypoint[],
        ) => {
            withGorgiasChat((gorgiasChat) => {
                gorgiasChat.updateSelfServiceConfiguration?.({
                    workflowsEntrypoints: workflowEntryPoints,
                })
            })
        }

        const handlePageChange = (page: string) => {
            if (page === 'conversation' || page === 'homepage') {
                displayPage(page)
                openChat()
            }
        }

        const reloadPreview = () => {
            setReloadKey(reloadKey + 1)
        }

        const updatePreviewOrders = (
            options: GorgiasChatPreviewOrdersOptions,
        ) => {
            withGorgiasChat((gorgiasChat) => {
                gorgiasChat.setOrders?.(options)
            })
        }

        const simulateConversation = useCallback(
            (messages: SimulateConversationMessage[]) => {
                withGorgiasChat((gorgiasChat) => {
                    gorgiasChat.simulateConversation?.(messages, 0)
                })
            },
            [],
        )

        const setConversationMessages = useCallback(
            (messages: SimulateConversationMessage[]) => {
                withGorgiasChat((gorgiasChat) => {
                    if (gorgiasChat.setConversationMessages) {
                        gorgiasChat.setConversationMessages(messages)
                    } else {
                        gorgiasChat.simulateConversation?.(messages, 0)
                    }
                })
            },
            [],
        )

        const onLoaded = useCallback(
            (gorgiasChat: NonNullable<Window['GorgiasChat']>) => {
                const currentOrders = previewOrdersRef.current
                if (currentOrders) {
                    gorgiasChat.setOrders?.(currentOrders)
                }
                const page = initialPage ?? selectedPage
                if (page === 'track' && currentOrders?.orders) {
                    const orderName = Object.keys(currentOrders.orders)[0]
                    gorgiasChat.setPage('track', { orderName })
                } else {
                    gorgiasChat.setPage(page)
                }
                onChatLoaded?.()
            },
            [initialPage, selectedPage, onChatLoaded],
        )

        useImperativeHandle(ref, () => ({
            displayPage,
            updatePosition,
            updateSettings,
            updateTexts,
            closeChat,
            openChat,
            updateWorkflowEntryPoints,
            reloadPreview,
            updatePreviewOrders,
            simulateConversation,
            setConversationMessages,
        }))

        return (
            <Box flexDirection="column" className={css.panel}>
                <Box
                    alignItems="center"
                    justifyContent="space-between"
                    className={css.header}
                >
                    <Text variant={TextVariant.Medium}>Chat preview</Text>
                    {headerActions ?? (
                        <ButtonGroup
                            selectedKey={selectedPage}
                            defaultSelectedKey="homepage"
                            onSelectionChange={handlePageChange}
                        >
                            <ButtonGroupItem
                                id="homepage"
                                icon={<Icon name="nav-home" />}
                            />
                            <ButtonGroupItem
                                id="conversation"
                                icon={
                                    <Icon name="comm-chat-conversation-circle" />
                                }
                            />
                        </ButtonGroup>
                    )}
                </Box>
                <Box flexGrow={1} className={css.content}>
                    {appId && (
                        <ChatPreview
                            key={chatPreviewKey}
                            ref={chatPreviewRef}
                            appId={appId}
                            language={locale}
                            onLoaded={onLoaded}
                        />
                    )}
                </Box>
            </Box>
        )
    },
)
