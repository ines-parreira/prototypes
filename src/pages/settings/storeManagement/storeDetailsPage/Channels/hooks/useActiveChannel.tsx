import { useState } from 'react'

import { ChannelChange } from '../../../types'
import { Channel } from './useChannels'

export default function UseActiveChannel() {
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
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
