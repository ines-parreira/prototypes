import { createContext, useContext, useState } from 'react'

import { useParams } from 'react-router-dom'

type ChatPreviewChannelsContextValue = {
    selectedChannelId: number | undefined
    setSelectedChannelId: (chatId: number | undefined) => void
    shopName: string
}

export const ChatPreviewChannelsContext =
    createContext<ChatPreviewChannelsContextValue | null>(null)

export const useChatPreviewChannelsContext =
    (): ChatPreviewChannelsContextValue => {
        const context = useContext(ChatPreviewChannelsContext)
        if (!context) {
            throw new Error(
                'useChatPreviewChannelsContext must be used within ChatPreviewChannelsContext',
            )
        }
        return context
    }

export const useChatPreviewChannels = (initialSelectedChannelId?: number) => {
    const { shopName } = useParams<{ shopName: string }>()

    const [selectedChannelId, setSelectedChannelId] = useState<
        number | undefined
    >(initialSelectedChannelId)

    return {
        selectedChannelId,
        setSelectedChannelId,
        shopName,
    }
}
