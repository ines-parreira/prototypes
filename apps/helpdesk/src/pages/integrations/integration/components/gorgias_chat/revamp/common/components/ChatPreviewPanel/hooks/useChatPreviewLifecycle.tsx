import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { LANGUAGE } from 'constants/languages'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../ChatPreviewPanel'
import type { ChatPreviewPanelHandle } from '../ChatPreviewPanel'

type Options = {
    headerActions?: ReactNode
    showBusinessHoursToggle?: boolean
    locale?: LANGUAGE
    shouldShowChatVersionSwitcher?: boolean
}

export const useChatPreviewLifecycle = ({
    headerActions,
    showBusinessHoursToggle,
    locale,
    shouldShowChatVersionSwitcher = false,
}: Options) => {
    const { setIsCollapsibleColumnOpen, warpToCollapsibleColumn } =
        useCollapsibleColumn()

    const [appId, setAppId] = useState<string | null>(null)
    const panelRef = useRef<ChatPreviewPanelHandle>(null)
    const loadSubscribersRef = useRef<Set<() => void>>(new Set())

    const handlePreviewLoaded = useCallback(() => {
        loadSubscribersRef.current.forEach((callback) => callback())
    }, [])

    /**
     * Subscribes to the chat preview loaded event.
     *
     * @param callback - Called when the chat preview iframe finishes loading.
     * @param fireIfAlreadyLoaded - When `true`, fires `callback` immediately if
     *   the preview is already loaded, then subscribes for future reloads.
     * @returns A cleanup function that unsubscribes the callback.
     */
    const onChatPreviewLoaded = useCallback(
        (callback: () => void, fireIfAlreadyLoaded?: boolean) => {
            if (fireIfAlreadyLoaded && panelRef.current?.isLoaded) {
                callback()
            }
            loadSubscribersRef.current.add(callback)
            return () => {
                loadSubscribersRef.current.delete(callback)
            }
        },
        [],
    )

    const chatPreviewPortal = warpToCollapsibleColumn(
        <ChatPreviewPanel
            ref={panelRef}
            appId={appId}
            headerActions={headerActions}
            showBusinessHoursToggle={showBusinessHoursToggle}
            locale={locale}
            onPreviewLoaded={handlePreviewLoaded}
            shouldShowChatVersionSwitcher={shouldShowChatVersionSwitcher}
        />,
    )

    const showPreviewPanel = useCallback(
        (nextAppId: string | null) => {
            setAppId(nextAppId)
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

    return {
        panelRef,
        chatPreviewPortal,
        showPreviewPanel,
        hidePreviewPanel,
        onChatPreviewLoaded,
    }
}
