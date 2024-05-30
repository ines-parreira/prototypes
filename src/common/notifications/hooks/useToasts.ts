import {FeedEventPayload, FeedRealTimeCallback} from '@knocklabs/client'
import {useKnockFeed} from '@knocklabs/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {notificationSounds} from 'services'
import {defaultSound} from 'services/NotificationSounds'
import {getNotificationSettings} from 'state/currentUser/selectors'

import {Notification, RawNotification} from '../types'
import transformKnockNotification from '../utils/transformKnockNotification'

export default function useToasts() {
    const notificationSettings = useAppSelector(getNotificationSettings)
    const notificationVolume = useMemo(
        () =>
            notificationSettings?.data?.notification_sound?.volume ||
            defaultSound.volume,
        [notificationSettings]
    )
    const eventSettings = useMemo(
        () => notificationSettings?.data?.events || {},
        [notificationSettings]
    )

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

            if (!mappedItems.length) return

            const notificationType = mappedItems[0].type
            let sound = eventSettings[notificationType]?.sound
            if (sound === undefined) {
                sound = defaultSound.sound
            }
            if (sound) {
                notificationSounds.play(sound, notificationVolume)
            }

            mappedItems.forEach((notification) => {
                queueHide(notification.id)
            })
            setNotifications((n) => [...n, ...mappedItems])
        },
        [eventSettings, notificationVolume, queueHide]
    )

    useEffect(() => {
        feedClient.on(
            'items.received.realtime',
            // remove cast after consultation with knock team
            handleNotificationsReceived as unknown as FeedRealTimeCallback
        )

        return () => {
            feedClient.off(
                'items.received.realtime',
                // remove cast after consultation with knock team
                handleNotificationsReceived as unknown as FeedRealTimeCallback
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
