import { useCallback, useState } from 'react'

import { useSidebar } from '@repo/navigation'
import type { Notification, NotificationTileProps } from '@repo/notifications'
import { NotificationsFeedPanel } from '@repo/notifications'

import { Popover } from '@gorgias/axiom'

import getNotificationConfig from 'common/notifications/utils/getNotificationConfig'

import { NavigationSidebarNotificationsButton } from './NavigationSidebarNotificationsButton'

export function NavigationSidebarNotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false)
    const { isCollapsed } = useSidebar()

    const handleClose = useCallback(() => setIsOpen(false), [])

    const renderItem = useCallback(
        (notification: Notification, { onClick }: NotificationTileProps) => {
            const config = getNotificationConfig(notification)
            if (!config) return null
            const Component = config.component
            return (
                <Component
                    key={notification.id}
                    notification={notification}
                    onClick={onClick}
                />
            )
        },
        [],
    )

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            trigger={<NavigationSidebarNotificationsButton />}
            placement="right"
            padding={0}
            offset={isCollapsed ? 8 : 70}
        >
            <NotificationsFeedPanel
                onClose={handleClose}
                renderItem={renderItem}
            />
        </Popover>
    )
}
