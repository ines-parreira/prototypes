import { useState } from 'react'

import { ChannelChange, ChannelWithMetadata } from '../../../types'

export default function UseActiveChannel() {
    const [activeChannel, setActiveChannel] =
        useState<ChannelWithMetadata | null>(null)
    const [changes, setChanges] = useState<ChannelChange[]>([])

    const reset = () => {
        setActiveChannel(null)
        setChanges([])
    }

    return {
        activeChannel,
        setActiveChannel,
        changes,
        setChanges,
        reset,
    }
}
