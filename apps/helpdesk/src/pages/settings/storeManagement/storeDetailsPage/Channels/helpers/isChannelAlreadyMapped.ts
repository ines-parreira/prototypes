import type { ChannelWithMetadata } from '../../../types'

export default function isChannelAlreadyMapped(
    activeChannel: ChannelWithMetadata,
    channelId: number,
) {
    const channelsAlreadyMapped =
        activeChannel?.assignedChannels.map((ch) => ch.id) ?? []
    return channelsAlreadyMapped.includes(channelId)
}
