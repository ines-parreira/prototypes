import { Link } from 'react-router-dom'

import { LegacyIconButton as IconButton } from '@gorgias/axiom'

import { Integration } from 'models/integration/types'

import { ChannelWithMetadata } from '../../../types'
import determineChannelLink from '../helpers/determineChannelLink'
import {
    shouldShowDeleteButton,
    shouldShowEditButton,
} from './ChannelsList.helpers'

import css from '../ChannelsDrawer/ChannelsDrawer.less'

interface ChannelItemProps {
    channel: Integration
    activeChannel: ChannelWithMetadata
    onDelete: (id: number) => void
}

export default function ChannelItem({
    channel,
    activeChannel,
    onDelete,
}: ChannelItemProps) {
    return (
        <div className={css.ticketFieldRowContainer}>
            <div className={css.labels}>
                <span className={css.primaryLabel}>{channel.name}</span>
                <span className={css.secondaryLabel}>
                    {'address' in channel.meta
                        ? (channel.meta.address as string)
                        : ''}
                </span>
            </div>
            <div className={css.actions}>
                {shouldShowEditButton(channel) && (
                    <Link target="_blank" to={determineChannelLink(channel)}>
                        <IconButton
                            size="small"
                            icon="open_in_new"
                            intent="secondary"
                            fillStyle="ghost"
                        />
                    </Link>
                )}
                {shouldShowDeleteButton(activeChannel, channel) && (
                    <IconButton
                        size="small"
                        icon="delete"
                        intent="destructive"
                        fillStyle="ghost"
                        onClick={() => onDelete(channel.id)}
                    />
                )}
            </div>
        </div>
    )
}
