import React, {useCallback, useMemo} from 'react'
import {useKnockFeed} from '@knocklabs/react'

import {logEvent, SegmentEvent} from 'common/segment'

import useToasts from '../hooks/useToasts'

import Toast from './Toast'
import css from './Toasts.less'

export default function Toasts() {
    const {dismiss, notifications} = useToasts()
    const {feedClient} = useKnockFeed()

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

    const handleClick = useCallback(
        (itemId) => {
            logEvent(SegmentEvent.NotificationToastClicked)
            const knockItem = feedClient
                .getState()
                .items.find((item) => item.id === itemId)

            if (knockItem) {
                void feedClient.markAsRead(knockItem)
            }
        },
        [feedClient]
    )

    return (
        <div className={css.container}>
            {reversedNotifications.map((notification) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onDismiss={dismissers[notification.id]}
                    onClick={() => {
                        handleClick(notification.id)
                    }}
                />
            ))}
        </div>
    )
}
