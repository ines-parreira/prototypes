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
    Banner,
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import type { LANGUAGE } from 'constants/languages'
import type {
    GorgiasChatPosition,
    GorgiasChatPreviewApplicationSettings,
} from 'models/integration/types'
import type {
    GorgiasChatPreviewOrdersOptions,
    GorgiasChatPreviewSelfServiceFlows,
    GorgiasChatWorkflowEntrypoint,
} from 'models/integration/types/gorgiasChat'

import { ChatPreview } from './components/ChatPreview/ChatPreview'
import type { ChatPreviewHandle } from './components/ChatPreview/ChatPreview'
import { ChatPreviewDefault } from './components/ChatPreviewDefault/ChatPreviewDefault'

import css from './ChatPreviewPanel.less'

export type ChatPreviewPage =
    | 'homepage'
    | 'conversation'
    | 'orders'
    | 'track'
    | 'report'
    | 'reported-issue'

export type ChatPreviewPageOptions = {
    orderName?: string
    reasonKey?: string
    responseText?: string
    showHelpfulPrompt?: boolean
}

export type ChatPreviewBusinessHoursMode =
    | 'during-business-hours'
    | 'outside-business-hours'

const PREVIEW_BUSINESS_HOURS_INPUT: Record<
    ChatPreviewBusinessHoursMode,
    {
        timezone: string
        businessHours: {
            days: number[]
            fromTime: string
            toTime: string
        }[]
    }
> = {
    'during-business-hours': {
        timezone: 'UTC',
        businessHours: [
            {
                days: [1, 2, 3, 4, 5, 6, 7],
                fromTime: '00:00',
                toTime: '00:00',
            },
        ],
    },
    'outside-business-hours': {
        timezone: 'UTC',
        businessHours: [],
    },
}

const BUSINESS_HOURS_PREVIEW_OPTIONS: {
    id: ChatPreviewBusinessHoursMode
    label: string
}[] = [
    {
        id: 'during-business-hours',
        label: 'During Business Hours',
    },
    {
        id: 'outside-business-hours',
        label: 'Outside Business Hours',
    },
]

export type SimulateConversationMessage = {
    text: string
    isHtml?: boolean
    fromAgent: boolean
    isBot: boolean
}

export type ChatPreviewPanelHandle = {
    displayPage: (
        page: ChatPreviewPage,
        options?: ChatPreviewPageOptions,
    ) => void
    updatePosition: (position: GorgiasChatPosition) => void
    updateSettings: (settings: GorgiasChatPreviewApplicationSettings) => void
    updateTexts: (texts: Record<string, string>) => void
    updateSSPTexts: (texts: Record<string, string>) => void
    closeChat: () => void
    openChat: () => void
    updateWorkflowEntryPoints: (
        workflowEntrypoints: GorgiasChatWorkflowEntrypoint[],
    ) => void
    updateOrderManagementFlows: (
        flows: GorgiasChatPreviewSelfServiceFlows,
    ) => void
    reloadPreview: () => void
    updatePreviewOrders: (options: GorgiasChatPreviewOrdersOptions) => void
    simulateConversation: (messages: SimulateConversationMessage[]) => void
    setConversationMessages: (messages: SimulateConversationMessage[]) => void
    isLoaded: boolean
}

type Props = {
    appId: string | null
    headerActions?: ReactNode
    locale?: LANGUAGE
    onPreviewLoaded?: () => void
    withHeader?: boolean
    supportDefaultChatPreview?: boolean
    forceChatRedesign?: boolean
    showBusinessHoursToggle?: boolean
}

type BusinessHoursToggleProps = {
    selectedMode: ChatPreviewBusinessHoursMode
    onSelectionChange: (mode: string) => void
}

const BusinessHoursToggle = ({
    selectedMode,
    onSelectionChange,
}: BusinessHoursToggleProps) => (
    <Box alignItems="stretch" className={css.businessHoursToggle}>
        <ButtonGroup
            selectedKey={selectedMode}
            onSelectionChange={onSelectionChange}
        >
            {BUSINESS_HOURS_PREVIEW_OPTIONS.map(({ id, label }) => (
                <ButtonGroupItem key={id} id={id}>
                    {label}
                </ButtonGroupItem>
            ))}
        </ButtonGroup>
    </Box>
)

export const ChatPreviewPanel = forwardRef<ChatPreviewPanelHandle, Props>(
    (
        {
            appId,
            headerActions,
            locale,
            onPreviewLoaded,
            withHeader = true,
            supportDefaultChatPreview = false,
            forceChatRedesign = false,
            showBusinessHoursToggle = false,
        }: Props,
        ref,
    ) => {
        const chatPreviewRef = useRef<ChatPreviewHandle>(null)
        const [selectedPage, setSelectedPage] =
            useState<ChatPreviewPage>('homepage')

        const [reloadKey, setReloadKey] = useState(0)
        const [businessHoursMode, setBusinessHoursMode] =
            useState<ChatPreviewBusinessHoursMode>('during-business-hours')

        const shouldRenderBusinessHoursToggle =
            showBusinessHoursToggle &&
            Boolean(appId || supportDefaultChatPreview)

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
            (page: ChatPreviewPage, options?: ChatPreviewPageOptions) => {
                withGorgiasChat((gorgiasChat) => {
                    const isTabPage =
                        page === 'homepage' || page === 'conversation'
                    if (isTabPage) {
                        setSelectedPage(page)
                    }

                    gorgiasChat.setPage(page, options)
                })
            },
            [],
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

        const applyBusinessHoursMode = useCallback(
            (mode: ChatPreviewBusinessHoursMode) => {
                withGorgiasChat((gorgiasChat) => {
                    gorgiasChat.setCustomBusinessHours?.(
                        PREVIEW_BUSINESS_HOURS_INPUT[mode],
                    )
                })
            },
            [],
        )

        const handleBusinessHoursModeChange = useCallback(
            (mode: string) => {
                if (
                    mode === 'during-business-hours' ||
                    mode === 'outside-business-hours'
                ) {
                    setBusinessHoursMode(mode)
                    applyBusinessHoursMode(mode)
                }
            },
            [applyBusinessHoursMode],
        )

        /**
         * The iframe runs in a separate JS realm, so plain objects created in this
         * realm fail the `instanceof Object` check inside the chat widget. We build
         * the target using the iframe's own Object constructor so it belongs to the
         * correct realm. `Object` isn't declared on the typed Window surface exposed
         * via `contentWindow`, so we narrow the cast to this helper.
         */
        const createIframeObject = useCallback(
            <T extends Record<string, string>>(source: T): T | undefined => {
                const iframeWindow = chatPreviewRef.current?.iframeRef.current
                    ?.contentWindow as
                    | (Window & { Object: ObjectConstructor })
                    | null
                    | undefined
                if (!iframeWindow) return undefined
                return Object.assign(new iframeWindow.Object(), source) as T
            },
            [],
        )

        const updateTexts = (texts: Record<string, string>) => {
            withGorgiasChat((gorgiasChat) => {
                const iframeTexts = createIframeObject(texts)
                if (iframeTexts) gorgiasChat.updateTexts(iframeTexts)
            })
        }

        const updateSSPTexts = (texts: Record<string, string>) => {
            withGorgiasChat((gorgiasChat) => {
                const iframeTexts = createIframeObject(texts)
                if (iframeTexts) gorgiasChat.updateSSPTexts(iframeTexts)
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

        const updateOrderManagementFlows = (
            flows: GorgiasChatPreviewSelfServiceFlows,
        ) => {
            withGorgiasChat((gorgiasChat) => {
                gorgiasChat.updateSelfServiceConfiguration?.({ flows })
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
                    gorgiasChat.simulateConversation?.(messages, 1500)
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
                if (forceChatRedesign) {
                    const iframeWindow =
                        chatPreviewRef.current?.iframeRef.current?.contentWindow
                    if (iframeWindow?.gorgiasChatConfiguration) {
                        iframeWindow.gorgiasChatConfiguration.featureFlags = {
                            ...iframeWindow.gorgiasChatConfiguration
                                .featureFlags,
                            'linear.AIEXP-8485.enforce-chat-2-0-without-ai-agent': true,
                        }
                    }
                }

                if (showBusinessHoursToggle) {
                    gorgiasChat.setCustomBusinessHours?.(
                        PREVIEW_BUSINESS_HOURS_INPUT[businessHoursMode],
                    )
                }

                const sspTexts =
                    GORGIAS_CHAT_SSP_TEXTS[
                        locale ?? GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
                    ] ??
                    GORGIAS_CHAT_SSP_TEXTS[GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]
                if (sspTexts) {
                    const iframeTexts = createIframeObject(sspTexts)
                    if (iframeTexts) gorgiasChat.updateSSPTexts(iframeTexts)
                }

                gorgiasChat.setPage(selectedPage)
                onPreviewLoaded?.()
            },
            [
                selectedPage,
                onPreviewLoaded,
                locale,
                createIframeObject,
                forceChatRedesign,
                showBusinessHoursToggle,
                businessHoursMode,
            ],
        )

        const renderPreviewContent = () => {
            if (appId) {
                return (
                    <ChatPreview
                        key={chatPreviewKey}
                        ref={chatPreviewRef}
                        appId={appId}
                        language={locale}
                        onLoaded={onLoaded}
                        fitChatWindowHeight={showBusinessHoursToggle}
                    />
                )
            }

            if (supportDefaultChatPreview) {
                return (
                    <ChatPreviewDefault
                        key={chatPreviewKey}
                        ref={chatPreviewRef}
                        onLoaded={onLoaded}
                    />
                )
            }

            return (
                <Box p="md">
                    <Banner
                        intent="warning"
                        icon="warning-triangle"
                        isClosable={false}
                        title="Connect a Chat or Help Center to your store to use this feature."
                    />
                </Box>
            )
        }

        useImperativeHandle(ref, () => ({
            displayPage,
            updatePosition,
            updateSettings,
            updateTexts,
            updateSSPTexts,
            closeChat,
            openChat,
            updateWorkflowEntryPoints,
            updateOrderManagementFlows,
            reloadPreview,
            updatePreviewOrders,
            simulateConversation,
            setConversationMessages,
            get isLoaded() {
                return chatPreviewRef.current?.isLoaded ?? false
            },
        }))

        return (
            <Box flexDirection="column" className={css.panel}>
                {withHeader && (
                    <Box
                        alignItems="center"
                        justifyContent="space-between"
                        className={`${css.header} ${
                            shouldRenderBusinessHoursToggle
                                ? css.headerWithBusinessHoursToggle
                                : ''
                        }`}
                    >
                        <Text variant={TextVariant.Medium}>Chat preview</Text>
                        {headerActions ??
                            (appId && (
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
                                            <Icon name="chat-conversation-circle" />
                                        }
                                    />
                                </ButtonGroup>
                            ))}
                    </Box>
                )}
                {withHeader && shouldRenderBusinessHoursToggle && (
                    <BusinessHoursToggle
                        selectedMode={businessHoursMode}
                        onSelectionChange={handleBusinessHoursModeChange}
                    />
                )}
                <Box
                    flexGrow={appId || supportDefaultChatPreview ? 1 : 0}
                    className={css.content}
                >
                    {renderPreviewContent()}
                </Box>
            </Box>
        )
    },
)
