import type { ChannelsReportData } from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import type { Channel } from 'services/channels'
import { notEmpty } from 'utils'

export const nonEmptyChannels = (
    channels: Channel[],
    reportData: ChannelsReportData,
) => {
    const channelVisibility: Record<string, boolean> = Object.values(
        reportData,
    ).reduce<Record<string, boolean>>((acc, metricDataOrChannels) => {
        if (
            metricDataOrChannels.data === null ||
            metricDataOrChannels.data === undefined
        ) {
            return acc
        }

        const channelDimension =
            metricDataOrChannels.data.dimensions?.[0] ?? CHANNEL_DIMENSION

        metricDataOrChannels.data.allData
            .map((data) => data[channelDimension])
            .filter(notEmpty)
            .forEach((channel) => {
                acc[channel] = true
            })

        return acc
    }, {})

    return channels.filter(
        (channel: Channel) => channelVisibility[channel.slug] ?? false,
    )
}
