import type { ReactNode } from 'react'
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'

import { Banner, Box, ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import type { LANGUAGE } from 'constants/languages'

import { useLogMigrationEvent } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useLogMigrationEvent'
import type {
    ChatPreviewBusinessHoursMode,
    ChatPreviewPage,
    ChatPreviewPanelHandle,
} from './ChatPreviewPanel.types'
import { ChatPreview } from './components/ChatPreview/ChatPreview'
import type { ChatPreviewHandle } from './components/ChatPreview/ChatPreview'
import { ChatPreviewDefault } from './components/ChatPreviewDefault/ChatPreviewDefault'
import { ChatPreviewPanelHeader } from './components/ChatPreviewPanelHeader/ChatPreviewPanelHeader'

import { useGorgiasChatApi } from './hooks/useGorgiasChatApi'

import { FeatureFlagKey } from '@repo/feature-flags'
import css from './ChatPreviewPanel.less'

export type {
    ChatPreviewPageOptions,
    SimulateConversationMessage,
} from './ChatPreviewPanel.types'
export type {
    ChatPreviewBusinessHoursMode,
    ChatPreviewPage,
    ChatPreviewPanelHandle,
}

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
    { id: 'during-business-hours', label: 'During Business Hours' },
    { id: 'outside-business-hours', label: 'Outside Business Hours' },
]

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

        const chatApi = useGorgiasChatApi(chatPreviewRef)
        const { logBusinessHoursToggled } = useLogMigrationEvent()

        const shouldRenderBusinessHoursToggle =
            showBusinessHoursToggle &&
            Boolean(appId || supportDefaultChatPreview)

        const chatPreviewKey = useMemo(() => {
            return `${reloadKey}${locale ? '-' + locale : ''}-${
                forceChatRedesign ? 'redesign' : 'default'
            }`
        }, [reloadKey, locale, forceChatRedesign])

        const displayPage: ChatPreviewPanelHandle['displayPage'] = useCallback(
            (page, options) => {
                if (page === 'homepage' || page === 'conversation') {
                    setSelectedPage(page)
                }
                chatApi.displayPage(page, options)
            },
            [chatApi],
        )

        const handleBusinessHoursModeChange = useCallback(
            (mode: string) => {
                if (
                    mode === 'during-business-hours' ||
                    mode === 'outside-business-hours'
                ) {
                    setBusinessHoursMode(mode)
                    chatApi.setCustomBusinessHours(
                        PREVIEW_BUSINESS_HOURS_INPUT[mode],
                    )
                    logBusinessHoursToggled({
                        to:
                            mode === 'during-business-hours'
                                ? 'within'
                                : 'outside',
                    })
                }
            },
            [chatApi, logBusinessHoursToggled],
        )

        const handlePageChange = (page: string) => {
            if (page === 'conversation' || page === 'homepage') {
                displayPage(page)
                chatApi.openChat()
            }
        }

        const reloadPreview = useCallback(() => {
            setReloadKey((k) => k + 1)
        }, [])

        const onLoaded = useCallback(
            (
                gorgiasChat: Window['GorgiasChat'],
                gorgiasChatConfiguration: Window['gorgiasChatConfiguration'],
            ) => {
                if (gorgiasChatConfiguration && forceChatRedesign) {
                    gorgiasChatConfiguration.featureFlags = {
                        ...gorgiasChatConfiguration.featureFlags,
                        [FeatureFlagKey.ChatClientUiRedesignProject]: true,
                        [FeatureFlagKey.EnforceChatRedesignWithoutAiAgent]: true,
                    }
                }

                if (showBusinessHoursToggle) {
                    gorgiasChat?.setCustomBusinessHours?.(
                        PREVIEW_BUSINESS_HOURS_INPUT[businessHoursMode],
                    )
                }

                const sspTexts =
                    GORGIAS_CHAT_SSP_TEXTS[
                        locale ?? GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
                    ] ??
                    GORGIAS_CHAT_SSP_TEXTS[GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]
                if (sspTexts) {
                    const iframeTexts = chatApi.createIframeObject(sspTexts)
                    if (iframeTexts) gorgiasChat?.updateSSPTexts(iframeTexts)
                }

                gorgiasChat?.setPage(selectedPage)
                onPreviewLoaded?.()
            },
            [
                selectedPage,
                onPreviewLoaded,
                locale,
                chatApi,
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

        useImperativeHandle(ref, () => {
            const {
                createIframeObject: __createIframeObject,
                setCustomBusinessHours: __setCustomBusinessHours,
                displayPage: __chatApiDisplayPage,
                ...exposed
            } = chatApi
            return {
                ...exposed,
                displayPage,
                reloadPreview,
                get isLoaded() {
                    return chatPreviewRef.current?.isLoaded ?? false
                },
            }
        })

        return (
            <Box flexDirection="column" className={css.panel}>
                {withHeader && (
                    <ChatPreviewPanelHeader
                        appId={appId}
                        selectedPage={selectedPage}
                        onPageChange={handlePageChange}
                        headerActions={headerActions}
                        withBusinessHoursToggle={
                            shouldRenderBusinessHoursToggle
                        }
                    />
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
