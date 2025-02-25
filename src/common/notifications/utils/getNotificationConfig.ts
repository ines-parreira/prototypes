import { notifications } from '../data'
import type { Notification } from '../types'

export default function getNotificationConfig(notification: Notification) {
    const config = notifications[notification.type]
    if (!config?.mapType) return config

    const mappedType = config.mapType(notification)
    return notifications[mappedType] || config
}
