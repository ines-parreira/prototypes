import type { ReactNode } from 'react'
import { useState } from 'react'

import { Link } from 'react-router-dom'

import {
    Box,
    Button,
    Heading,
    Icon,
    ListItem,
    SelectField,
} from '@gorgias/axiom'

import { useNotificationItems } from '../hooks/useNotificationItems'
import type { Notification } from '../types'
import { NotificationsPanel } from './NotificationsPanel'
import type { NotificationTileProps } from './NotificationTile'

const FILTER_ITEMS = [
    { id: 'all', name: 'All' },
    { id: 'unread', name: 'Unread' },
    { id: 'read', name: 'Read' },
]

type FilterItem = (typeof FILTER_ITEMS)[number]

export interface NotificationsFeedPanelProps {
    onClose?: () => void
    renderItem: (
        notification: Notification,
        tileProps: NotificationTileProps,
    ) => ReactNode
}

export function NotificationsFeedPanel({
    onClose,
    renderItem,
}: NotificationsFeedPanelProps) {
    const [filter, setFilter] = useState<FilterItem>(FILTER_ITEMS[0])
    const { items: allItems, markAllAsRead } = useNotificationItems(onClose)

    const items =
        filter.id === 'all'
            ? allItems
            : allItems.filter((item) =>
                  filter.id === 'read'
                      ? item.readDatetime !== null
                      : item.readDatetime === null,
              )

    return (
        <NotificationsPanel
            title={
                <Box gap="xxxs" alignItems="center">
                    <Heading size="xl">Notifications</Heading>
                    <Button
                        as={Link}
                        to="/app/settings/notifications"
                        icon={<Icon name="settings" />}
                        variant="tertiary"
                        size="sm"
                        aria-label="Settings"
                        onClick={onClose}
                    />
                </Box>
            }
            toolbar={
                <SelectField
                    items={FILTER_ITEMS}
                    value={filter}
                    onChange={setFilter}
                    aria-label="Filter notifications"
                >
                    {(item) => <ListItem label={item.name} />}
                </SelectField>
            }
            items={items}
            onMarkAllAsRead={markAllAsRead}
            onClose={onClose}
        >
            {() => items.map((item) => renderItem(item.notification, item))}
        </NotificationsPanel>
    )
}
