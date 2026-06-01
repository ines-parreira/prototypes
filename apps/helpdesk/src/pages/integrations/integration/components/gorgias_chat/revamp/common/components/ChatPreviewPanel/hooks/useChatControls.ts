import type { RefObject } from 'react'
import { useCallback } from 'react'

import type { GorgiasChatPosition } from 'models/integration/types'

import type {
    ChatPreviewPage,
    ChatPreviewPageOptions,
    ChatPreviewPanelHandle,
    SimulateConversationMessage,
} from '../ChatPreviewPanel'

export const useChatControls = (
    panelRef: RefObject<ChatPreviewPanelHandle>,
) => {
    const closeChat = useCallback(() => {
        panelRef.current?.closeChat()
    }, [panelRef])

    const openChat = useCallback(() => {
        panelRef.current?.openChat()
    }, [panelRef])

    const displayPage = useCallback(
        (page: ChatPreviewPage, options?: ChatPreviewPageOptions) => {
            panelRef.current?.displayPage(page, options)
        },
        [panelRef],
    )

    const reloadPreview = useCallback(() => {
        panelRef.current?.reloadPreview()
    }, [panelRef])

    const updatePosition = useCallback(
        (position: GorgiasChatPosition) => {
            closeChat()
            panelRef.current?.updatePosition(position)
        },
        [panelRef, closeChat],
    )

    const setConversationMessages = useCallback(
        (messages: SimulateConversationMessage[]) => {
            panelRef.current?.setConversationMessages(messages)
        },
        [panelRef],
    )

    const simulateEmailCapture = useCallback(() => {
        panelRef.current?.simulateEmailCapture()
    }, [panelRef])

    return {
        openChat,
        closeChat,
        displayPage,
        reloadPreview,
        updatePosition,
        setConversationMessages,
        simulateEmailCapture,
    }
}
