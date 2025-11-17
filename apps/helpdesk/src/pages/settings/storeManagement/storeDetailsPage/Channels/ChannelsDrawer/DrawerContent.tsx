import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

import type { ChannelChange, ChannelWithMetadata } from '../../../types'
import ChannelsFilter from '../ChannelsFilter/ChannelsFilter'
import ChannelsList from '../ChannelsList/ChannelsList'
import determineChannelLabels from '../helpers/determineChannelLabels'
import { trackChannelChanges } from '../hooks/trackChannelChanges'
import DrawerHeader from './DrawerHeader'

import css from './ChannelsDrawer.less'

interface ChannelsDrawerContentProps {
    activeChannel: ChannelWithMetadata
    setChanges: Dispatch<SetStateAction<ChannelChange[]>>
}

export default function DrawerContent({
    activeChannel,
    setChanges,
}: ChannelsDrawerContentProps) {
    const [assignedChannelIds, setAssignedChannelIds] = useState<number[]>([])

    useEffect(() => {
        setAssignedChannelIds(activeChannel.assignedChannels.map((ch) => ch.id))
    }, [activeChannel.assignedChannels])

    useEffect(() => {
        const changes = trackChannelChanges(assignedChannelIds, activeChannel)
        setChanges(changes)
    }, [assignedChannelIds, activeChannel, setChanges])

    const onDeleteListItem = (id: number) => {
        setAssignedChannelIds((prev) =>
            prev.filter((channelId) => channelId !== id),
        )
    }
    const labels = determineChannelLabels(activeChannel)
    return (
        <div className={css.formGroup}>
            <DrawerHeader channel={activeChannel} />
            <ChannelsFilter
                selectorLabel={labels.selectorLabel}
                setAssignedChannelIds={setAssignedChannelIds}
                assignedChannelIds={assignedChannelIds}
                activeChannel={activeChannel}
            />
            <ChannelsList
                listLabel={labels.listLabel}
                activeChannel={activeChannel}
                channels={[
                    ...activeChannel.unassignedChannels,
                    ...activeChannel.assignedChannels,
                ].filter((channel) => assignedChannelIds.includes(channel.id))}
                onDelete={onDeleteListItem}
            />
        </div>
    )
}
