import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { ChannelChange, ChannelWithMetadata } from '../../../types'
import ChannelsFilter from '../ChannelsFilter/ChannelsFilter'
import ChannelsList from '../ChannelsList/ChannelsList'
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
    const [assignedChannelIds, setAssignedChannelIds] = useState<number[]>(
        activeChannel?.assignedChannels.map((ch) => ch.id) ?? [],
    )
    useEffect(() => {
        const changes = trackChannelChanges(assignedChannelIds, activeChannel)
        setChanges?.(changes)
    }, [assignedChannelIds, activeChannel, setChanges])

    const onDeleteListItem = (id: number) => {
        setAssignedChannelIds((prev) =>
            prev.filter((channelId) => channelId !== id),
        )
    }

    return (
        <div className={css.formGroup}>
            <DrawerHeader channel={activeChannel} />
            <ChannelsFilter
                setAssignedChannelIds={setAssignedChannelIds}
                assignedChannelIds={assignedChannelIds}
                activeChannel={activeChannel}
            />
            <ChannelsList
                channelType={activeChannel.type}
                channels={[
                    ...activeChannel.unassignedChannels,
                    ...activeChannel.assignedChannels,
                ].filter((channel) => assignedChannelIds.includes(channel.id))}
                onDelete={onDeleteListItem}
            />
        </div>
    )
}
