import { ChannelChange, ChannelWithMetadata } from '../../../types'

export const trackChannelChanges = (
    assignedChannelIds: number[],
    activeChannel: ChannelWithMetadata | null,
): ChannelChange[] => {
    if (!activeChannel) {
        return []
    }

    const originalAssignedIds = activeChannel.assignedChannels.map(
        (ch) => ch.id,
    )

    const addedChannels = assignedChannelIds
        .filter((id) => !originalAssignedIds.includes(id))
        .map((id) => ({ channelId: id, action: 'add' as const }))

    const removedChannels = originalAssignedIds
        .filter((id) => !assignedChannelIds.includes(id))
        .map((id) => ({ channelId: id, action: 'remove' as const }))

    return [...addedChannels, ...removedChannels]
}
