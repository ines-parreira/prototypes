import { ChannelWithMetadata } from '../../../types'

export function getIntegrationLabels(
    channels: ChannelWithMetadata[],
    failedChannelIds: number[],
): string {
    return channels
        .flatMap((channel) => [
            ...channel.assignedChannels,
            ...channel.unassignedChannels,
        ])
        .filter((integration) => failedChannelIds.includes(integration.id))
        .map((integration) => integration.name)
        .join(', ')
}
