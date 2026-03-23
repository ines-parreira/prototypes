import { useState } from 'react'

import { useParams } from 'react-router-dom'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { ChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/ChatPreviewPanel'

import { ChatChannelSelector } from '../ChatChannelSelector/ChatChannelSelector'

export const ConnectedChannelsPreviewPanel = () => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const [selectedChannelId, setSelectedChannelId] = useState<
        number | undefined
    >(() => chatChannels[0]?.value.id)

    const selectedChannel =
        chatChannels.find((c) => c.value.id === selectedChannelId) ??
        chatChannels[0]
    const appId = selectedChannel?.value.meta.app_id ?? null

    return (
        <ChatPreviewPanel
            appId={appId}
            headerActions={
                chatChannels.length > 0 ? (
                    <ChatChannelSelector
                        chatChannels={chatChannels}
                        selectedChannelId={selectedChannelId}
                        onSelect={setSelectedChannelId}
                    />
                ) : undefined
            }
        />
    )
}
