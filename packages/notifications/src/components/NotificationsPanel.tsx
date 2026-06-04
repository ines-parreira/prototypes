import type { ReactNode } from 'react'

import { useIsMobileResolution } from '@repo/hooks'

import {
    Box,
    Button,
    Heading,
    Icon,
    Panel,
    PanelHeader,
    TileList,
} from '@gorgias/axiom'

import type { NotificationItem } from '../hooks/useNotificationItems'

export interface NotificationsPanelProps {
    title: ReactNode
    toolbar: ReactNode
    items: NotificationItem[]
    onMarkAllAsRead: () => void
    onClose?: () => void
    onLoadMore?: () => void
    children: (item: NotificationItem) => ReactNode
}

export function NotificationsPanel({
    title,
    toolbar,
    items,
    onMarkAllAsRead,
    onClose,
    onLoadMore,
    children,
}: NotificationsPanelProps) {
    const isMobileResolution = useIsMobileResolution()

    return (
        <Panel
            w={isMobileResolution ? '100%' : 382}
            margin={isMobileResolution ? 'auto' : undefined}
            height="calc(100dvh - var(--spacing-xs) * 2)"
            overflow="auto"
            withoutBorder
        >
            <PanelHeader
                title={title}
                trailingSlot={
                    onClose && (
                        <Button
                            icon={<Icon name="close" />}
                            variant="tertiary"
                            size="sm"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    )
                }
            >
                <Box gap="md" alignItems="center">
                    <Box flex="1">{toolbar}</Box>
                    <Button
                        variant="tertiary"
                        size="sm"
                        onClick={onMarkAllAsRead}
                    >
                        Mark all as read
                    </Button>
                </Box>
            </PanelHeader>
            <TileList
                items={items}
                onLoadMore={onLoadMore}
                aria-label="Notifications"
                renderEmptyState={() => (
                    <Box
                        h="100%"
                        flexDirection="column"
                        justifyContent="center"
                    >
                        <Heading>No notifications</Heading>
                    </Box>
                )}
            >
                {children}
            </TileList>
        </Panel>
    )
}
