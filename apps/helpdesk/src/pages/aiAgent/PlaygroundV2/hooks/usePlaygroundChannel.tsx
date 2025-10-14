import { useCallback, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import useFlag from 'core/flags/hooks/useFlag'

import { PlaygroundChannelAvailability, PlaygroundChannels } from '../types'

type UsePlaygroundChannelReturn = {
    channel: PlaygroundChannels
    channelAvailability: PlaygroundChannelAvailability
    onChannelChange: (channel: PlaygroundChannels) => void
    onChannelAvailabilityChange: (
        availability: PlaygroundChannelAvailability,
    ) => void
}

export const usePlaygroundChannel = (): UsePlaygroundChannelReturn => {
    // Ensure useFlag is called with a proper default value
    const isStandalone = useFlag(
        FeatureFlagKey.StandaloneHandoverCapabilities,
        false,
    )

    const [channel, setChannel] = useState<PlaygroundChannels>(
        isStandalone ? 'chat' : 'email',
    )
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

    return {
        channel,
        channelAvailability,
        onChannelChange: handleChannelChange,
        onChannelAvailabilityChange: handleChannelAvailabilityChange,
    }
}
