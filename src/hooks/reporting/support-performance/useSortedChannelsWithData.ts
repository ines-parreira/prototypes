import {useChannelsReportMetrics} from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {Channel} from 'services/channels'
import {notEmpty} from 'utils'

export const useSortedChannelsWithData = (): {
    channels: Channel[]
    isLoading: boolean
} => {
    const {channels, reportData, isLoading} = useChannelsReportMetrics()

    let visibleChannels = channels

    if (!isLoading && reportData !== null) {
        const channelVisibility: Record<string, boolean> = Object.values(
            reportData
        ).reduce<Record<string, boolean>>((acc, metricDataOrChannels) => {
            if (metricDataOrChannels.data === null) {
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
        visibleChannels = channels.filter(
            (channel: Channel) => channelVisibility[channel.slug] ?? false
        )
    }

    return {
        channels: visibleChannels,
        isLoading,
    }
}
