import React, { useCallback } from 'react'

import { createPortal } from 'react-dom'
import NotificationsSystem, { dismissNotification } from 'reapop'

import { useAppNode } from 'appNode'
import useAppDispatch from 'hooks/useAppDispatch'
import { NotificationIcon } from 'pages/common/components/NotificationIcon'
import notificationsTheme from 'pages/common/components/Notifications'

import useAlertNotifications from '../hooks/useAlertNotifications'

export default function Notifications() {
    const dispatch = useAppDispatch()
    const alertNotifications = useAlertNotifications()
    const appNode = useAppNode()

    const dismiss = useCallback(
        (id) => {
            dispatch(dismissNotification(id))
        },
        [dispatch],
    )

    return createPortal(
        <NotificationsSystem
            components={{ NotificationIcon }}
            dismissNotification={dismiss}
            notifications={alertNotifications}
            theme={notificationsTheme}
        />,
        appNode ?? document.body,
    )
}
