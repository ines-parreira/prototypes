import { IconButton } from '@gorgias/merchant-ui-kit'

import { ChannelIntegrationItem, ChannelTypes } from '../hooks/useChannels'

import css from '../ChannelsDrawer/ChannelsDrawer.less'

interface AssignedChannelsListProps {
    channelType: ChannelTypes
    channels: ChannelIntegrationItem[]
    onDelete: (id: number) => void
}

export default function ChannelsList({
    channelType,
    channels,
    onDelete,
}: AssignedChannelsListProps) {
    if (!channels?.length) {
        return null
    }

    return (
        <div className={css.assignedChannelsListContainer}>
            <span className={css.listTitleLabel}>Assigned {channelType}</span>
            {channels.map((channel) => (
                <div className={css.ticketFieldRowContainer} key={channel.id}>
                    <div className={css.labels}>
                        <span className={css.primaryLabel}>{channel.name}</span>
                        <span className={css.secondaryLabel}>
                            {channel.meta.address}
                        </span>
                    </div>
                    {/*TODO links for open new*/}
                    <IconButton
                        size="small"
                        icon="open_in_new"
                        intent="primary"
                        fillStyle="ghost"
                    />
                    <IconButton
                        size="small"
                        icon="close"
                        intent="destructive"
                        fillStyle="ghost"
                        onClick={() => onDelete(channel.id)}
                    />
                </div>
            ))}
        </div>
    )
}
