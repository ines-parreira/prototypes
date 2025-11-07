import { useCallback, useState } from 'react'

import { PlaygroundChannelAvailability, PlaygroundChannels } from '../types'

type UsePlaygroundChannelReturn = {
    channel: PlaygroundChannels
    channelAvailability: PlaygroundChannelAvailability
    onChannelChange: (channel: PlaygroundChannels) => void
    onChannelAvailabilityChange: (
        availability: PlaygroundChannelAvailability,
    ) => void
    resetToDefaultChannel: () => void
}

const DEFAULT_CHANNEL = 'chat'

export const usePlaygroundChannel = (): UsePlaygroundChannelReturn => {
    const [channel, setChannel] = useState<PlaygroundChannels>(DEFAULT_CHANNEL)

    const [channelAvailability, setChannelAvailability] =
        useState<PlaygroundChannelAvailability>('online')

    const handleChannelChange = useCallback(
        (newChannel: PlaygroundChannels) => {
            setChannel(newChannel)
        },
        [],
    )

    const handleChannelAvailabilityChange = useCallback(
        (availability: PlaygroundChannelAvailability) => {
            setChannelAvailability(availability)
        },
        [],
    )

    const resetToDefaultChannel = useCallback(
        () => setChannel(DEFAULT_CHANNEL),
        [],
    )

    return {
        channel,
        channelAvailability,
        resetToDefaultChannel,
        onChannelChange: handleChannelChange,
        onChannelAvailabilityChange: handleChannelAvailabilityChange,
    }
}
