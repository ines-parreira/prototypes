import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { notificationSounds } from 'services'
import { defaultSound } from 'services/NotificationSounds'
import { getNotificationSettings } from 'state/currentUser/selectors'

import type { Notification } from '../types'
import getNotificationConfig from '../utils/getNotificationConfig'
import useNotifications from './useNotifications'

export default function useToasts() {
    const notificationSettings = useAppSelector(getNotificationSettings)
    const notificationVolume = useMemo(
        () =>
            notificationSettings?.data?.notification_sound?.volume ||
            defaultSound.volume,
        [notificationSettings],
    )
    const eventSettings = useMemo(
        () => notificationSettings?.data?.events || {},
        [notificationSettings],
    )

    const [notifications, setNotifications] = useState<Notification[]>([])
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

    const dismiss = useCallback((notificationId: string) => {
        setNotifications((n) =>
            n.filter((notification) => notification.id !== notificationId),
        )
    }, [])

    const queueHide = useCallback(
        (notificationId: string) => {
            const timeout = setTimeout(() => {
                dismiss(notificationId)
            }, 5000)

            timeoutsRef.current = [...timeoutsRef.current, timeout]
        },
        [dismiss],
    )

    const handleNotificationReceived = useCallback(
        (notification: Notification) => {
            const config = getNotificationConfig(notification)
            let sound = (
                eventSettings[config.workflow] || eventSettings[config.type]
            )?.sound
            if (sound === undefined) {
                sound = defaultSound.sound
            }
            if (sound) {
                notificationSounds.play(sound, notificationVolume)
            }

            queueHide(notification.id)
            setNotifications((n) => [...n, notification])
        },
        [eventSettings, notificationVolume, queueHide],
    )
    useNotifications(handleNotificationReceived)

    useEffect(
        () => () => {
            timeoutsRef.current.forEach((timeout) => {
                clearTimeout(timeout)
            })
        },
        [],
    )

    return useMemo(() => ({ dismiss, notifications }), [dismiss, notifications])
}
