import {FeedEventPayload} from '@knocklabs/client'
import {useKnockFeed} from '@knocklabs/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {Notification, RawNotification} from '../types'
import transformKnockNotification from '../utils/transformKnockNotification'

export default function useToasts() {
    const {feedClient} = useKnockFeed()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

    const dismiss = useCallback((notificationId: string) => {
        setNotifications((n) =>
            n.filter((notification) => notification.id !== notificationId)
        )
    }, [])

    const queueHide = useCallback(
        (notificationId: string) => {
            const timeout = setTimeout(() => {
                dismiss(notificationId)
            }, 5000)

            timeoutsRef.current = [...timeoutsRef.current, timeout]
        },
        [dismiss]
    )

    const handleNotificationsReceived = useCallback(
        ({items}: FeedEventPayload<RawNotification>) => {
            const mappedItems = items
                .map(transformKnockNotification)
                .filter((notification) => !!notification) as Notification[]

            mappedItems.forEach((notification) => {
                queueHide(notification.id)
            })
            setNotifications((n) => [...n, ...mappedItems])
        },
        [queueHide]
    )

    useEffect(() => {
        feedClient.on('items.received.realtime', handleNotificationsReceived)

        return () => {
            feedClient.off(
                'items.received.realtime',
                handleNotificationsReceived
            )
        }
    }, [feedClient, handleNotificationsReceived])

    useEffect(
        () => () => {
            timeoutsRef.current.forEach((timeout) => {
                clearTimeout(timeout)
            })
        },
        []
    )

    return useMemo(() => ({dismiss, notifications}), [dismiss, notifications])
}
