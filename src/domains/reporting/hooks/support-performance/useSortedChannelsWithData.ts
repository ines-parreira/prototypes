import { useMemo } from 'react'

import { useChannelsReportMetrics } from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { nonEmptyChannels } from 'domains/reporting/hooks/support-performance/nonEmptyChannel'
import { Channel } from 'services/channels'

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
