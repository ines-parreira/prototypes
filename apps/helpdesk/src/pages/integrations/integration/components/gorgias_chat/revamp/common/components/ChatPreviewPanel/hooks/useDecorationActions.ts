import type { RefObject } from 'react'
import { useCallback } from 'react'

import type {
    GorgiasChatAvatarSettings,
    GorgiasChatAvatarType,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatLauncherSettings,
} from 'models/integration/types/gorgiasChat'

import type {
    ChatPreviewPage,
    ChatPreviewPageOptions,
    ChatPreviewPanelHandle,
} from '../ChatPreviewPanel'
import { normalizeHex } from '../utils/normalizeHex'

type Controls = {
    openChat: () => void
    closeChat: () => void
    displayPage: (
        page: ChatPreviewPage,
        options?: ChatPreviewPageOptions,
    ) => void
}

export const useDecorationActions = (
    panelRef: RefObject<ChatPreviewPanelHandle>,
    { openChat, closeChat, displayPage }: Controls,
) => {
    const updateMainColor = useCallback(
        (color: string) => {
            panelRef.current?.updateSettings({
                decoration: { mainColor: normalizeHex(color) },
            })
            openChat()
        },
        [panelRef, openChat],
    )

    const updateConversationColor = useCallback(
        (color: string) => {
            panelRef.current?.updateSettings({
                decoration: { conversationColor: normalizeHex(color) },
            })
            displayPage('conversation')
            openChat()
        },
        [panelRef, openChat, displayPage],
    )

    const updateBackgroundStyle = useCallback(
        (backgroundColorStyle: GorgiasChatBackgroundColorStyle) => {
            panelRef.current?.updateSettings({
                decoration: { backgroundColorStyle },
            })
            displayPage('homepage')
            openChat()
        },
        [panelRef, displayPage, openChat],
    )

    const updateHeaderPictureUrl = useCallback(
        (imageUrl: string | undefined) => {
            panelRef.current?.updateSettings({
                decoration: { headerPictureUrl: imageUrl },
            })
            displayPage('homepage')
            openChat()
        },
        [panelRef, displayPage, openChat],
    )

    const updateHeaderAlternativePictureUrl = useCallback(
        (imageUrl: string | undefined) => {
            panelRef.current?.updateSettings({
                decoration: { headerAlternativePictureUrl: imageUrl },
            })
            displayPage('homepage')
            openChat()
        },
        [panelRef, displayPage, openChat],
    )

    const updateMainFontFamily = useCallback(
        (mainFontFamily: string) => {
            panelRef.current?.updateSettings({
                decoration: { mainFontFamily },
            })
            displayPage('homepage')
            openChat()
        },
        [panelRef, displayPage, openChat],
    )

    const updateLauncher = useCallback(
        (settings: GorgiasChatLauncherSettings) => {
            panelRef.current?.updateSettings({
                decoration: { launcher: settings },
            })
            closeChat()
        },
        [panelRef, closeChat],
    )

    const updateAvatarSettings = useCallback(
        (avatarSettings: {
            avatarTeamPictureUrl?: string
            avatarType?: GorgiasChatAvatarType
            avatar?: GorgiasChatAvatarSettings | null
        }) => {
            openChat()
            displayPage('conversation')

            panelRef.current?.updateSettings({
                decoration: {
                    ...avatarSettings,
                },
            })
        },
        [panelRef, openChat, displayPage],
    )

    const updateDisplayBotLabel = useCallback(
        (displayBotLabel: boolean) => {
            panelRef.current?.updateSettings({
                decoration: { displayBotLabel },
            })
            displayPage('conversation')
            openChat()
        },
        [panelRef, openChat, displayPage],
    )

    return {
        updateMainColor,
        updateConversationColor,
        updateBackgroundStyle,
        updateHeaderPictureUrl,
        updateHeaderAlternativePictureUrl,
        updateMainFontFamily,
        updateLauncher,
        updateAvatarSettings,
        updateDisplayBotLabel,
    }
}
