import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { desktopNotify } from '../desktopNotify'
import { requestNotificationPermission } from '../requestNotificationPermission'
import type { Notification } from '../types'
import getNotificationConfig from '../utils/getNotificationConfig'
import useNotifications from './useNotifications'

export function useDesktopNotifications() {
    const hasDesktopNotifications = useFlag(FeatureFlagKey.DesktopNotifications)

    const onNotificationReceived = useCallback(
        async (notification: Notification) => {
            if (!hasDesktopNotifications) return

            const hasPermission = await requestNotificationPermission()
            if (!hasPermission) return

            const config = getNotificationConfig(notification)
            if (!config) return

            const { description, title } = config.getDesktopNotification?.(
                notification,
            ) || { title: 'New notification' }

            desktopNotify(notification.id, title, description)
        },
        [hasDesktopNotifications],
    )

    useNotifications(onNotificationReceived)
}
