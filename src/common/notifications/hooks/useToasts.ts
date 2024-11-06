import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import getNotificationSound from 'common/notifications/utils/getNotificationSound'
import useAppSelector from 'hooks/useAppSelector'
import {notificationSounds} from 'services'
import {defaultSound} from 'services/NotificationSounds'
import {getNotificationSettings} from 'state/currentUser/selectors'

import {Notification} from '../types'

import useNotifications from './useNotifications'

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

    const handleNotificationReceived = useCallback(
        (notification: Notification) => {
            const sound = getNotificationSound(notification, eventSettings)
            if (sound) {
                notificationSounds.play(sound, notificationVolume)
            }

            queueHide(notification.id)
            setNotifications((n) => [...n, notification])
        },
        [eventSettings, notificationVolume, queueHide]
    )
    useNotifications(handleNotificationReceived)

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
