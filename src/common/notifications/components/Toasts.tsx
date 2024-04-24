import React, {useMemo} from 'react'

import useToasts from '../hooks/useToasts'

import NotificationContent from './NotificationContent'
import Toast from './Toast'
import css from './Toasts.less'

export default function Toasts() {
    const notifications = useToasts()

    const reversedNotifications = useMemo(
        () => notifications.reverse(),
        [notifications]
    )

    return (
        <div className={css.container}>
            {reversedNotifications.map((notification) => (
                <Toast key={notification.id}>
                    <NotificationContent notification={notification} />
                </Toast>
            ))}
        </div>
    )
}
