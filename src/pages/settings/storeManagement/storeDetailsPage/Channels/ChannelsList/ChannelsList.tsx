import { Link } from 'react-router-dom'

import { IconButton } from '@gorgias/merchant-ui-kit'

import { Integration } from 'models/integration/types'

import {
    isContactFormChannel,
    isHelpCenterChannel,
} from '../../../helpers/isIntegration'
import determineChannelLink from '../helpers/determineChannelLink'

import css from '../ChannelsDrawer/ChannelsDrawer.less'

interface AssignedChannelsListProps {
    listLabel: string
    channels: Integration[]
    onDelete: (id: number) => void
}

export default function ChannelsList({
    listLabel,
    channels,
    onDelete,
}: AssignedChannelsListProps) {
    if (!channels?.length) {
        return null
    }

    return (
        <div className={css.assignedChannelsListContainer}>
            <span className={css.listTitleLabel}>{listLabel}</span>
            {channels.map((channel) => (
                <div className={css.ticketFieldRowContainer} key={channel.id}>
                    <div className={css.labels}>
                        <span className={css.primaryLabel}>{channel.name}</span>
                        <span className={css.secondaryLabel}>
                            {'address' in channel.meta
                                ? channel.meta.address
                                : ''}
                        </span>
                    </div>
                    <div className={css.actions}>
                        {!isHelpCenterChannel(channel) &&
                            !isContactFormChannel(channel) && (
                                <Link to={determineChannelLink(channel)}>
                                    <IconButton
                                        size="small"
                                        icon="open_in_new"
                                        intent="secondary"
                                        fillStyle="ghost"
                                    />
                                </Link>
                            )}

                        <IconButton
                            size="small"
                            icon="delete"
                            intent="destructive"
                            fillStyle="ghost"
                            onClick={() => onDelete(channel.id)}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
