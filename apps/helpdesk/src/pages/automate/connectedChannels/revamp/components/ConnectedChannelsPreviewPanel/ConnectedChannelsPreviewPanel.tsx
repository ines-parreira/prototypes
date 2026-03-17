import { useState } from 'react'

import { useParams } from 'react-router-dom'

import { Box, Heading } from '@gorgias/axiom'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { ChatChannelSelector } from '../ChatChannelSelector/ChatChannelSelector'

import css from './ConnectedChannelsPreviewPanel.less'

export const ConnectedChannelsPreviewPanel = () => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const [selectedChannelId, setSelectedChannelId] = useState<
        number | undefined
    >(() => chatChannels[0]?.value.id)

    return (
        <Box flexDirection="column" className={css.panel}>
            <Box
                alignItems="center"
                justifyContent="space-between"
                className={css.header}
            >
                <Heading size="sm">Chat preview</Heading>
                {chatChannels.length > 0 && (
                    <ChatChannelSelector
                        chatChannels={chatChannels}
                        selectedChannelId={selectedChannelId}
                        onSelect={setSelectedChannelId}
                    />
                )}
            </Box>
        </Box>
    )
}
