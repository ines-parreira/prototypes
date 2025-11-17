import { useMemo, useState } from 'react'

import type { ChannelChange, ChannelWithMetadata } from '../../../types'

export default function useActiveChannel(channels: ChannelWithMetadata[]) {
    const [activeChannelType, setActiveChannelType] = useState<string | null>(
        null,
    )
    const [changes, setChanges] = useState<ChannelChange[]>([])

    const reset = () => {
        setActiveChannelType(null)
        setChanges([])
    }

    const activeChannel = useMemo(() => {
        return channels.find((channel) => channel.type === activeChannelType)
    }, [channels, activeChannelType])
    return {
        activeChannel,
        setActiveChannelType,
        changes,
        setChanges,
        reset,
    }
}
