import React, { useCallback } from 'react'

import { createPortal } from 'react-dom'
import NotificationsSystem, { dismissNotification } from 'reapop'

import useAppDispatch from 'hooks/useAppDispatch'
import { NotificationIcon } from 'pages/common/components/NotificationIcon'
import notificationsTheme from 'pages/common/components/Notifications'

import useAlertNotifications from '../hooks/useAlertNotifications'

export default function Notifications() {
    const dispatch = useAppDispatch()
    const alertNotifications = useAlertNotifications()

    // Target the dedicated notifications container to prevent React Aria modals
    // from marking notifications as inert (which blocks pointer events)
    const notificationsRoot = document.getElementById('notifications-root')

    const dismiss = useCallback(
        (id: string) => {
            dispatch(dismissNotification(id))
        },
        [dispatch],
    )

    // Fallback to body if notifications-root doesn't exist
    const portalTarget = notificationsRoot ?? document.body

    return createPortal(
        <NotificationsSystem
            components={{ NotificationIcon }}
            dismissNotification={dismiss}
            notifications={alertNotifications}
            theme={notificationsTheme}
        />,
        portalTarget,
    )
}
