import { useCallback } from 'react'

import { FeedItem, FeedItem as KnockFeedItem } from '@knocklabs/client'
import {
    NotificationFeed,
    NotificationFeedHeaderProps,
    RenderItemProps,
    useKnockFeed,
} from '@knocklabs/react'
import {
    logEvent,
    NotificationCenterEventTypes,
    SegmentEvent,
} from '@repo/logging'

import { RawNotification } from '../types'
import transformKnockNotification from '../utils/transformKnockNotification'
import FeedHeader from './FeedHeader'
import FeedItemComponent from './FeedItem'

import css from './Feed.less'

type Props = {
    onClose?: () => void
}

export default function Feed({ onClose }: Props) {
    const { feedClient } = useKnockFeed()

    const handleClickNotification = useCallback(
        (item: KnockFeedItem) => {
            logEvent(SegmentEvent.NotificationCenter, {
                type: NotificationCenterEventTypes.FeedItemClicked,
            })
            void feedClient.markAsRead(item)
            onClose?.()
        },
        [feedClient, onClose],
    )

    const handleToggleRead = useCallback(
        (item: KnockFeedItem) => {
            const isRead = !!item.read_at

            logEvent(SegmentEvent.NotificationCenter, {
                type: NotificationCenterEventTypes.StatusToggled,
                status: isRead ? 'unread' : 'read',
            })
            isRead
                ? void feedClient.markAsUnread(item)
                : void feedClient.markAsRead(item)
        },
        [feedClient],
    )

    const renderHeader = useCallback(
        (renderHeaderProps: NotificationFeedHeaderProps) => (
            <FeedHeader
                {...renderHeaderProps}
                onToggleVisibility={() => onClose?.()}
            />
        ),
        [onClose],
    )

    const renderItem = useCallback(
        ({ item }: RenderItemProps) => {
            const notification = transformKnockNotification(
                // remove cast after consultation with knock team
                item as FeedItem<RawNotification>,
            )
            return !notification ? null : (
                <FeedItemComponent
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleClickNotification(item)}
                    onToggleRead={() => handleToggleRead(item)}
                />
            )
        },
        [handleClickNotification, handleToggleRead],
    )

    return (
        <div className={css.feed}>
            <NotificationFeed
                renderItem={renderItem}
                renderHeader={renderHeader}
            />
        </div>
    )
}
