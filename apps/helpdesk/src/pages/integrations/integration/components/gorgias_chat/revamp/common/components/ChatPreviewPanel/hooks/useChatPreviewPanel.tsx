import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

import type { LANGUAGE } from 'constants/languages'

import { useChatControls } from './useChatControls'
import { useChatPreviewLifecycle } from './useChatPreviewLifecycle'
import { useDecorationActions } from './useDecorationActions'
import { usePreferenceActions } from './usePreferenceActions'
import { useSelfServiceActions } from './useSelfServiceActions'
import { useTextActions } from './useTextActions'

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

export const useChatPreviewPanel = (
    options: UseChatPreviewPanelOptions = {},
) => {
    const {
        panelRef,
        chatPreviewPortal,
        showPreviewPanel,
        hidePreviewPanel,
        onChatPreviewLoaded,
    } = useChatPreviewLifecycle(options)

    const controls = useChatControls(panelRef)
    const decoration = useDecorationActions(panelRef, controls)
    const texts = useTextActions(panelRef)
    const preferences = usePreferenceActions(panelRef, controls)
    const selfService = useSelfServiceActions(panelRef, controls)

    return {
        chatPreviewPortal,
        showPreviewPanel,
        hidePreviewPanel,
        onChatPreviewLoaded,
        ...controls,
        ...decoration,
        ...texts,
        ...preferences,
        ...selfService,
    }
}
