import React from 'react'

import {Badge, useNotificationsOverlay} from 'common/notifications'

import Item from './GlobalNavigationItem'
import css from './NotificationsItem.less'

export default function NotificationsItem() {
    const [, onToggle] = useNotificationsOverlay()

    return (
        <Item icon="notifications" onClick={onToggle}>
            <Badge className={css.badge} />
        </Item>
    )
}
