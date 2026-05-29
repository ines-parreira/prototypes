import type { RefObject } from 'react'
import { useCallback } from 'react'

import type {
    GorgiasChatPosition,
    GorgiasChatPreviewApplicationSettings,
} from 'models/integration/types'
import type {
    GorgiasChatPreviewOrdersOptions,
    GorgiasChatPreviewSelfServiceFlows,
    GorgiasChatWorkflowEntrypoint,
} from 'models/integration/types/gorgiasChat'

import type {
    ChatPreviewPage,
    ChatPreviewPageOptions,
    SimulateConversationMessage,
} from '../ChatPreviewPanel.types'
import type { ChatPreviewHandle } from '../components/ChatPreview/ChatPreview'

type GorgiasChat = NonNullable<Window['GorgiasChat']>

const logDev = (error: unknown) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(error)
    }
}

/**
 * Wraps the imperative chat iframe API.
 *
 * Owns the two iframe-realm quirks:
 * - Guarding every call behind `isLoaded && !hasError && contentWindow.GorgiasChat`.
 * - Building objects with the iframe's own `Object` constructor so the
 *   widget's `instanceof Object` checks pass (different JS realm).
 */
export const useGorgiasChatApi = (
    chatPreviewRef: RefObject<ChatPreviewHandle>,
) => {
    const withGorgiasChat = useCallback(
        (
            callback: (gorgiasChat: GorgiasChat) => void | Promise<void>,
        ): void => {
            const ref = chatPreviewRef.current
            if (!ref?.isLoaded || ref?.hasError) return

            const gorgiasChat =
                ref.iframeRef.current?.contentWindow?.GorgiasChat
            if (!gorgiasChat) return

            try {
                const result = callback(gorgiasChat)
                if (result instanceof Promise) {
                    result.catch(logDev)
                }
            } catch (error) {
                logDev(error)
            }
        },
        [chatPreviewRef],
    )

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
        [chatPreviewRef],
    )

    const displayPage = useCallback(
        (page: ChatPreviewPage, options?: ChatPreviewPageOptions) => {
            withGorgiasChat((gorgiasChat) => gorgiasChat.setPage(page, options))
        },
        [withGorgiasChat],
    )

    const closeChat = useCallback(() => {
        withGorgiasChat((gorgiasChat) => gorgiasChat.close())
    }, [withGorgiasChat])

    const openChat = useCallback(() => {
        withGorgiasChat((gorgiasChat) => gorgiasChat.open())
    }, [withGorgiasChat])

    const updatePosition = useCallback(
        (position: GorgiasChatPosition) => {
            withGorgiasChat((gorgiasChat) => gorgiasChat.setPosition(position))
        },
        [withGorgiasChat],
    )

    const updateSettings = useCallback(
        (settings: GorgiasChatPreviewApplicationSettings) => {
            withGorgiasChat((gorgiasChat) =>
                gorgiasChat.updateSettings?.(settings),
            )
        },
        [withGorgiasChat],
    )

    const updateTexts = useCallback(
        (texts: Record<string, string>) => {
            withGorgiasChat((gorgiasChat) => {
                const iframeTexts = createIframeObject(texts)
                if (iframeTexts) gorgiasChat.updateTexts(iframeTexts)
            })
        },
        [withGorgiasChat, createIframeObject],
    )

    const updatePreviewTexts = useCallback(
        (texts: Record<string, string>) => {
            withGorgiasChat((gorgiasChat) => {
                const iframeTexts = createIframeObject(texts)
                if (!iframeTexts) return

                if (gorgiasChat.updatePreviewTexts) {
                    gorgiasChat.updatePreviewTexts(iframeTexts)
                    return
                }

                gorgiasChat.updateTexts(iframeTexts)
            })
        },
        [withGorgiasChat, createIframeObject],
    )

    const updateSSPTexts = useCallback(
        (texts: Record<string, string>) => {
            withGorgiasChat((gorgiasChat) => {
                const iframeTexts = createIframeObject(texts)
                if (iframeTexts) gorgiasChat.updateSSPTexts(iframeTexts)
            })
        },
        [withGorgiasChat, createIframeObject],
    )

    const updateWorkflowEntryPoints = useCallback(
        (workflowEntryPoints: GorgiasChatWorkflowEntrypoint[]) => {
            withGorgiasChat((gorgiasChat) => {
                gorgiasChat.updateSelfServiceConfiguration?.({
                    workflowsEntrypoints: workflowEntryPoints,
                })
            })
        },
        [withGorgiasChat],
    )

    const updateOrderManagementFlows = useCallback(
        (flows: GorgiasChatPreviewSelfServiceFlows) => {
            withGorgiasChat((gorgiasChat) => {
                gorgiasChat.updateSelfServiceConfiguration?.({ flows })
            })
        },
        [withGorgiasChat],
    )

    const updatePreviewOrders = useCallback(
        (options: GorgiasChatPreviewOrdersOptions) => {
            withGorgiasChat((gorgiasChat) => {
                gorgiasChat.setOrders?.(options)
            })
        },
        [withGorgiasChat],
    )

    const simulateConversation = useCallback(
        (messages: SimulateConversationMessage[]) => {
            withGorgiasChat((gorgiasChat) => {
                gorgiasChat.simulateConversation?.(messages, 1500)
            })
        },
        [withGorgiasChat],
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
        [withGorgiasChat],
    )

    const setCustomBusinessHours = useCallback(
        (
            input: Parameters<
                NonNullable<GorgiasChat['setCustomBusinessHours']>
            >[0],
        ) => {
            withGorgiasChat((gorgiasChat) => {
                gorgiasChat.setCustomBusinessHours?.(input)
            })
        },
        [withGorgiasChat],
    )

    return {
        createIframeObject,
        displayPage,
        closeChat,
        openChat,
        updatePosition,
        updateSettings,
        updateTexts,
        updatePreviewTexts,
        updateSSPTexts,
        updateWorkflowEntryPoints,
        updateOrderManagementFlows,
        updatePreviewOrders,
        simulateConversation,
        setConversationMessages,
        setCustomBusinessHours,
    }
}
