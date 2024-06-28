import {useChannelsReportMetrics} from 'hooks/reporting/useChannelsReportMetrics'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {Channel} from 'services/channels'
import {notEmpty} from 'utils'

export const useSortedChannelsWithData = (): {
    channels: Channel[]
    isLoading: boolean
} => {
    const {reportData, isLoading} = useChannelsReportMetrics()

    let channels = reportData.channels

    if (!isLoading) {
        const channelVisibility: Record<string, boolean> = Object.values(
            reportData
        ).reduce<Record<string, boolean>>((acc, metricDataOrChannels) => {
            if (Array.isArray(metricDataOrChannels)) {
                return acc
            }

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
        channels = reportData.channels.filter(
            (channel: Channel) => channelVisibility[channel.slug] ?? false
        )
    }

    return {
        channels,
        isLoading,
    }
}
