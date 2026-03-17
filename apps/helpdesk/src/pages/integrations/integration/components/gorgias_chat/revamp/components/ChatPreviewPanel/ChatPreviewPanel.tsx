import { forwardRef, useImperativeHandle, useRef } from 'react'

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
    closeChat: () => void
    openChat: () => void
}

export const ChatPreviewPanel = forwardRef<
    ChatPreviewPanelHandle,
    { appId: string | null }
>(({ appId }, ref) => {
    const chatPreviewRef = useRef<ChatPreviewHandle>(null)

    const displayPage = (page: 'homepage' | 'conversation') => {
        chatPreviewRef.current?.iframeRef.current?.contentWindow?.GorgiasChat?.setPage(
            page,
        )
    }

    const closeChat = () => {
        chatPreviewRef.current?.iframeRef.current?.contentWindow?.GorgiasChat?.close()
    }

    const openChat = () => {
        chatPreviewRef.current?.iframeRef.current?.contentWindow?.GorgiasChat?.open()
    }

    const updatePosition = (position: GorgiasChatPosition) => {
        chatPreviewRef.current?.iframeRef.current?.contentWindow?.GorgiasChat?.setPosition(
            position,
        )
    }

    const updateSettings = (
        settings: GorgiasChatPreviewApplicationSettings,
    ) => {
        chatPreviewRef.current?.iframeRef.current?.contentWindow?.GorgiasChat?.updateSettings?.(
            settings,
        )
    }

    useImperativeHandle(ref, () => ({
        displayPage,
        updatePosition,
        updateSettings,
        closeChat,
        openChat,
    }))

    const handlePageChange = (key: string) => {
        if (key === 'conversation' || key === 'homepage') {
            displayPage(key)
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
                <ButtonGroup
                    defaultSelectedKey="homepage"
                    onSelectionChange={handlePageChange}
                >
                    <ButtonGroupItem
                        id="homepage"
                        icon={<Icon name="nav-home" />}
                    />
                    <ButtonGroupItem
                        id="conversation"
                        icon={<Icon name="comm-chat-conversation-circle" />}
                    />
                </ButtonGroup>
            </Box>
            <Box
                flexGrow={1}
                className={css.content}
                paddingLeft={Size.Md}
                paddingRight={Size.Md}
                paddingBottom={Size.Xxl}
                paddingTop={Size.Xxl}
            >
                {appId && <ChatPreview ref={chatPreviewRef} appId={appId} />}
            </Box>
        </Box>
    )
})
