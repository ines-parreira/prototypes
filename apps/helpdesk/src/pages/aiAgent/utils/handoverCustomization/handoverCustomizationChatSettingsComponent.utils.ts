import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

export const getAvailableChats = ({
    chatChannels,
    monitoredChatIntegrationIds = [],
}: {
    chatChannels: SelfServiceChatChannel[]
    monitoredChatIntegrationIds: number[] | null
}) => {
    if (!monitoredChatIntegrationIds?.length) {
        return []
    }

    return chatChannels.filter((chat) =>
        monitoredChatIntegrationIds.includes(chat.value.id),
    )
}

export const getFirstAvailableChat = ({
    chatChannels,
    monitoredChatIntegrationIds,
}: {
    chatChannels: SelfServiceChatChannel[]
    monitoredChatIntegrationIds: number[] | null
}) => {
    if (!monitoredChatIntegrationIds?.length) {
        return undefined
    }

    const availableChats = getAvailableChats({
        chatChannels,
        monitoredChatIntegrationIds,
    })

    for (const monitoredId of monitoredChatIntegrationIds) {
        const chat = availableChats.find(
            (chat) => chat.value.id === monitoredId,
        )
        if (chat) return chat
    }

    return undefined
}
