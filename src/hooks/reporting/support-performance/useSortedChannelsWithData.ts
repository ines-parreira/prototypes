import { useMemo } from 'react'

import { useChannelsReportMetrics } from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import { Channel } from 'services/channels'

import { nonEmptyChannels } from './nonEmptyChannel'

export const useSortedChannelsWithData = (): {
    channels: Channel[]
    isLoading: boolean
} => {
    const { channels, reportData, isLoading } = useChannelsReportMetrics()

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
