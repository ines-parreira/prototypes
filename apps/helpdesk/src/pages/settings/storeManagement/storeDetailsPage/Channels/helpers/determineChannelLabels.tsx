import type { ChannelWithMetadata } from '../../../types'

export function determineChannelLabels(channel: ChannelWithMetadata) {
    switch (channel.type) {
        case 'voice':
            return {
                selectorLabel: `Assign Phone Line`,
                listLabel: 'Assigned Phone Lines',
            }
        default:
            return {
                selectorLabel: `Assign ${channel.title}`,
                listLabel: `Assigned ${channel.title}`,
            }
    }
}
