import { Integration } from 'models/integration/types'

import { ChannelWithMetadata } from '../../../types'
import ChannelItem from './ChannelItem'
import ContactFormTooltip from './ContactFormTooltip'

import css from '../ChannelsDrawer/ChannelsDrawer.less'

interface AssignedChannelsListProps {
    listLabel: string
    channels: Integration[]
    onDelete: (id: number) => void
    activeChannel: ChannelWithMetadata
}

export default function ChannelsList({
    listLabel,
    channels,
    onDelete,
    activeChannel,
}: AssignedChannelsListProps) {
    if (!channels?.length) {
        return null
    }

    return (
        <div className={css.assignedChannelsListContainer}>
            <div className={css.listTitleLabel}>
                {listLabel}
                <ContactFormTooltip activeChannel={activeChannel} />
            </div>
            {channels.map((channel) => (
                <ChannelItem
                    key={channel.id}
                    channel={channel}
                    activeChannel={activeChannel}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
