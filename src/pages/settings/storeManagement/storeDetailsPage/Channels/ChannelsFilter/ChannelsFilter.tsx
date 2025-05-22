import { Dispatch, SetStateAction } from 'react'

import SelectFilter from 'pages/stats/common/SelectFilter'

import { Channel } from '../hooks/useChannels'
import { useFilterOperations } from '../hooks/useFilterOperations'
import CreateNewChannel from './CreateNewChannel'

interface ChannelsFilterProps {
    activeChannel?: Channel
    assignedChannelIds: number[]
    setAssignedChannelIds: Dispatch<SetStateAction<number[]>>
}

export default function ChannelsFilter({
    activeChannel,
    assignedChannelIds,
    setAssignedChannelIds,
}: ChannelsFilterProps) {
    const {
        selectedFilterItems,
        updateSelectedIntegrations,
        handleFilterClose,
    } = useFilterOperations(setAssignedChannelIds)

    if (!activeChannel) {
        return null
    }

    return (
        <SelectFilter
            onChange={(value) => updateSelectedIntegrations(value as number[])}
            onClose={handleFilterClose}
            value={selectedFilterItems}
            label={`Assign ${activeChannel.title}`}
            searchPlaceholder={activeChannel.title}
        >
            {[
                ...activeChannel.unassignedChannels,
                ...activeChannel.assignedChannels,
            ]
                .filter((channel) => !assignedChannelIds.includes(channel.id))
                .map((channel) => (
                    <SelectFilter.Item
                        key={channel.id}
                        label={channel.name}
                        value={channel.id}
                    />
                ))}
            <CreateNewChannel activeChannel={activeChannel} />
        </SelectFilter>
    )
}
