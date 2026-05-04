import type { ReactNode } from 'react'

import { Box, Button, Icon, Panel, PanelHeader } from '@gorgias/axiom'

import type { NotificationTileProps } from './NotificationTile'

export interface NotificationsPanelProps {
    title: ReactNode
    toolbar: ReactNode
    items: NotificationTileProps[]
    onMarkAllAsRead: () => void
    onClose?: () => void
    children:
        | ReactNode
        | ((props: { items: NotificationTileProps[] }) => ReactNode)
}

export function NotificationsPanel({
    title,
    toolbar,
    items,
    onMarkAllAsRead,
    onClose,
    children,
}: NotificationsPanelProps) {
    return (
        <Panel w={382} height="97vh" overflow="auto" withoutBorder>
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
            />
            <Box gap="md" alignItems="center" px="md">
                <Box flex="1">{toolbar}</Box>
                <Button variant="tertiary" size="sm" onClick={onMarkAllAsRead}>
                    Mark all as read
                </Button>
            </Box>
            <Box flexDirection="column">
                {typeof children === 'function'
                    ? children({ items })
                    : children}
            </Box>
        </Panel>
    )
}
