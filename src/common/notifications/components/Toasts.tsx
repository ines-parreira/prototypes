import React, {useMemo} from 'react'

import useToasts from '../hooks/useToasts'

import Toast from './Toast'
import css from './Toasts.less'

export default function Toasts() {
    const {dismiss, notifications} = useToasts()

    const reversedNotifications = useMemo(
        () => notifications.reverse(),
        [notifications]
    )

    const dismissers = useMemo(
        () =>
            notifications.reduce(
                (acc, notification) => ({
                    ...acc,
                    [notification.id]: () => dismiss(notification.id),
                }),
                {} as Record<string, () => void>
            ),
        [dismiss, notifications]
    )

    return (
        <div className={css.container}>
            {reversedNotifications.map((notification) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onDismiss={dismissers[notification.id]}
                />
            ))}
        </div>
    )
}
