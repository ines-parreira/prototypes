import { ChannelsReportData } from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import { Channel } from 'services/channels'
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

        metricDataOrChannels.data.allData
            .map((data) => data[CHANNEL_DIMENSION])
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
