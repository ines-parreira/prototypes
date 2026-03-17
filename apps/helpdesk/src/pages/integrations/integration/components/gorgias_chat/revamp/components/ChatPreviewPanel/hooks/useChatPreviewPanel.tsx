import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import type { GorgiasChatPosition } from 'models/integration/types'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../ChatPreviewPanel'
import type { ChatPreviewPanelHandle } from '../ChatPreviewPanel'

type ChatPreviewPanelContextValue = Omit<
    ReturnType<typeof useChatPreviewPanel>,
    'showPreviewPanel'
>

export const ChatPreviewPanelContext =
    createContext<ChatPreviewPanelContextValue | null>(null)

export const useGorgiasChatCreationWizardContext =
    (): ChatPreviewPanelContextValue => {
        const context = useContext(ChatPreviewPanelContext)
        if (!context) {
            throw new Error(
                'useGorgiasChatCreationWizardContext must be used within GorgiasChatCreationWizard',
            )
        }
        return context
    }

export const useChatPreviewPanel = () => {
    const { setCollapsibleColumnChildren, setIsCollapsibleColumnOpen } =
        useCollapsibleColumn()

    const [appId, setAppId] = useState<string | null>(null)
    const chatPreviewPanelRef = useRef<ChatPreviewPanelHandle>(null)

    const chatPreviewPanel = useMemo(() => {
        return <ChatPreviewPanel ref={chatPreviewPanelRef} appId={appId} />
    }, [appId])

    const showPreviewPanel = (appId: string | null) => {
        setAppId(appId)
        setIsCollapsibleColumnOpen(true)
    }

    useEffect(() => {
        setCollapsibleColumnChildren(chatPreviewPanel)
    }, [chatPreviewPanel, setCollapsibleColumnChildren])

    useEffect(() => {
        return () => {
            setIsCollapsibleColumnOpen(false)
            setCollapsibleColumnChildren(null)
        }
    }, [setCollapsibleColumnChildren, setIsCollapsibleColumnOpen])

    const updateMainColor = (color: string) => {
        chatPreviewPanelRef.current?.openChat()
        chatPreviewPanelRef.current?.updateSettings({
            decoration: {
                mainColor: color,
            },
        })
    }

    const updatePosition = (position: GorgiasChatPosition) => {
        chatPreviewPanelRef.current?.closeChat()
        chatPreviewPanelRef.current?.updatePosition(position)
    }

    const updateHeaderPictureUrl = (imageUrl: string | undefined) => {
        chatPreviewPanelRef.current?.updateSettings({
            decoration: { headerPictureUrl: imageUrl },
        })
        chatPreviewPanelRef.current?.displayPage('homepage')
        chatPreviewPanelRef.current?.openChat()
    }

    return {
        showPreviewPanel,
        updateMainColor,
        updatePosition,
        updateHeaderPictureUrl,
    }
}
