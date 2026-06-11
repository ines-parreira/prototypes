import { useNotificationsOverlay } from 'common/notifications'

import { GlobalNavigationItem as Item } from './GlobalNavigationItem'
import { GlobalNavigationNotificationBadge } from './GlobalNavigationNotificationBadge'

export function NotificationsItem() {
    const [, onToggle] = useNotificationsOverlay()

    return (
        <Item
            icon="notifications"
            label="Notifications"
            onClick={onToggle}
            tooltip={<span>Notifications</span>}
            data-candu-id="global-navigation-menu-notifications"
        >
            <GlobalNavigationNotificationBadge />
        </Item>
    )
}
