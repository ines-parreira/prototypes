import React from 'react'

import {useNotificationsOverlay} from 'common/notifications'

import Item from './GlobalNavigationItem'
import {GlobalNavigationNotificationBadge} from './GlobalNavigationNotificationBadge'

export default function NotificationsItem() {
    const [, onToggle] = useNotificationsOverlay()

    return (
        <Item
            icon="notifications"
            onClick={onToggle}
            tooltip={<span>Notifications</span>}
            data-candu-id="global-navigation-menu-notifications"
        >
            <GlobalNavigationNotificationBadge />
        </Item>
    )
}
