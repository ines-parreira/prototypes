import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Size,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import type {
    GorgiasChatPosition,
    GorgiasChatPreviewApplicationSettings,
} from 'models/integration/types'

import { ChatPreview } from './components/ChatPreview/ChatPreview'
import type { ChatPreviewHandle } from './components/ChatPreview/ChatPreview'

import css from './ChatPreviewPanel.less'

export type ChatPreviewPanelHandle = {
    displayPage: (page: 'homepage' | 'conversation') => void
    updatePosition: (position: GorgiasChatPosition) => void
    updateSettings: (settings: GorgiasChatPreviewApplicationSettings) => void
    updateTexts: (texts: Record<string, string>) => void
    closeChat: () => void
    openChat: () => void
}

type Props = {
    appId: string | null
    headerActions?: ReactNode
}

export const ChatPreviewPanel = forwardRef<ChatPreviewPanelHandle, Props>(
    ({ appId, headerActions }, ref) => {
        const chatPreviewRef = useRef<ChatPreviewHandle>(null)
        const [selectedPage, setSelectedPage] = useState<
            'homepage' | 'conversation'
        >('homepage')

        const withGorgiasChat = (
            callback: (gorgiasChat: NonNullable<Window['GorgiasChat']>) => void,
        ) => {
            const chatRef = chatPreviewRef.current
            if (!chatRef?.isLoaded || chatRef?.hasError) return
            const gorgiasChat =
                chatRef.iframeRef.current?.contentWindow?.GorgiasChat
            if (!gorgiasChat) return
            try {
                callback(gorgiasChat)
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error)
                }
            }
        }

        const displayPage = (page: 'homepage' | 'conversation') => {
            withGorgiasChat((gorgiasChat) => {
                setSelectedPage(page)
                gorgiasChat.setPage(page)
            })
        }

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

        useImperativeHandle(ref, () => ({
            displayPage,
            updatePosition,
            updateSettings,
            updateTexts,
            closeChat,
            openChat,
        }))

        const handlePageChange = (page: string) => {
            if (page === 'conversation' || page === 'homepage') {
                displayPage(page)
                openChat()
            }
        }

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
                <Box
                    flexGrow={1}
                    className={css.content}
                    paddingLeft={Size.Md}
                    paddingRight={Size.Md}
                    paddingBottom={Size.Xxl}
                    paddingTop={Size.Xxl}
                >
                    {appId && (
                        <ChatPreview ref={chatPreviewRef} appId={appId} />
                    )}
                </Box>
            </Box>
        )
    },
)
