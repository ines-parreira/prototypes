import {useMemo} from 'react'

import {
    ChannelsReportData,
    useChannelsReportMetrics,
} from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'

import {Channel} from 'services/channels'
import {notEmpty} from 'utils'

export const nonEmptyChannels = (
    channels: Channel[],
    reportData: ChannelsReportData
) => {
    const channelVisibility: Record<string, boolean> = Object.values(
        reportData
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
        (channel: Channel) => channelVisibility[channel.slug] ?? false
    )
}

export const useSortedChannelsWithData = (): {
    channels: Channel[]
    isLoading: boolean
} => {
    const {channels, reportData, isLoading} = useChannelsReportMetrics()

    const channelsWithData = useMemo(() => {
        let visibleChannels = channels

        if (!isLoading && reportData !== null) {
            visibleChannels = nonEmptyChannels(channels, reportData)
        }

        return visibleChannels
    }, [channels, isLoading, reportData])

    return {
        channels: channelsWithData,
        isLoading,
    }
}
