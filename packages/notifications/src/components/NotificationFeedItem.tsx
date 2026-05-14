import { useKnockFeed } from '@knocklabs/react'

import { useNotificationRenderContext } from '../context/NotificationRenderContext'
import type { Notification } from '../types'
import { NotificationTile } from './NotificationTile'
import type { NotificationTileProps } from './NotificationTile'

type NotificationFeedItemProps = Omit<
    NotificationTileProps,
    'id' | 'createdDatetime' | 'readDatetime' | 'onMarkAsUnread'
> & {
    notification: Notification
}

export function NotificationFeedItem({
    notification,
    ...props
}: NotificationFeedItemProps) {
    const { feedClient, useFeedStore } = useKnockFeed()
    const rawItems = useFeedStore((state) => state.items)
    const { isListItem } = useNotificationRenderContext()

    const onMarkAsUnread = () => {
        void feedClient.markAsUnread(
            rawItems.find((i) => i.id === notification.id)!,
        )
    }

    return (
        <NotificationTile
            id={notification.id}
            createdDatetime={notification.inserted_datetime}
            readDatetime={notification.read_datetime}
            onMarkAsUnread={onMarkAsUnread}
            isListItem={isListItem}
            {...props}
        />
    )
}
