import { useCallback } from 'react'

import { useKnockFeed } from '@knocklabs/react'

import type { NotificationTileProps } from '../components/NotificationTile'
import type { Notification } from '../types'
import { transformKnockNotification } from '../utils/transformKnockNotification'

export type NotificationItem = NotificationTileProps & {
    notification: Notification
}

type UseNotificationItemsResult = {
    items: NotificationItem[]
    markAllAsRead: () => void
    fetchNextPage: () => void
}

export function useNotificationItems(
    onNotificationClick?: () => void,
): UseNotificationItemsResult {
    const { feedClient, useFeedStore } = useKnockFeed()
    const rawItems = useFeedStore((state) => state.items)

    const markAllAsRead = useCallback(
        () => void feedClient.markAllAsRead(),
        [feedClient],
    )

    const fetchNextPage = useCallback(
        () => void feedClient.fetchNextPage(),
        [feedClient],
    )

    const items = rawItems
        .map((item) => {
            const notification = transformKnockNotification(
                item as Parameters<typeof transformKnockNotification>[0],
            )
            if (!notification) return null
            return {
                notification,
                id: notification.id,
                icon: 'comm-bell',
                title: notification.type,
                description: '',
                createdDatetime: notification.inserted_datetime,
                readDatetime: notification.read_datetime,
                onClick: () => {
                    void feedClient.markAsRead(
                        rawItems.find((i) => i.id === notification.id)!,
                    )
                    onNotificationClick?.()
                },
            }
        })
        .filter((n): n is NonNullable<typeof n> => n !== null)

    return { items, markAllAsRead, fetchNextPage }
}
