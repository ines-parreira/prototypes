import React, { useCallback, useMemo } from 'react'

import { useKnockFeed } from '@knocklabs/react'
import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'

import useToasts from '../hooks/useToasts'
import Toast from './Toast'

import css from './Toasts.less'

const MAX_WAYFINDING_TOASTS = 3

export default function Toasts() {
    const { dismiss, notifications } = useToasts()
    const { feedClient } = useKnockFeed()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const reversedNotifications = useMemo(() => {
        const reversed = notifications.slice().reverse()
        return hasWayfindingMS1Flag
            ? reversed.slice(0, MAX_WAYFINDING_TOASTS)
            : reversed
    }, [notifications, hasWayfindingMS1Flag])

    const dismissers = useMemo(
        () =>
            notifications.reduce(
                (acc, notification) => ({
                    ...acc,
                    [notification.id]: () => dismiss(notification.id),
                }),
                {} as Record<string, () => void>,
            ),
        [dismiss, notifications],
    )

    const handleClick = useCallback(
        (itemId: string) => {
            logEvent(SegmentEvent.NotificationToastClicked)
            const knockItem = feedClient
                .getState()
                .items.find((item) => item.id === itemId)

            if (knockItem) {
                void feedClient.markAsRead(knockItem)
            }
        },
        [feedClient],
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
