import { createContext, useState } from 'react'

import { useParams } from 'react-router-dom'

export const ChatSettingsRevampConnectedChannelsContext = createContext<{
    selectedChannelId: number | undefined
    setSelectedChannelId: (chatId: number | undefined) => void
}>({ selectedChannelId: undefined, setSelectedChannelId: () => {} })

export const useChatSettingsRevampConnectedChannels = () => {
    const { shopName } = useParams<{ shopName: string }>()

    const [selectedChannelId, setSelectedChannelId] = useState<
        number | undefined
    >()

    return {
        selectedChannelId,
        setSelectedChannelId,
        shopName,
    }
}
