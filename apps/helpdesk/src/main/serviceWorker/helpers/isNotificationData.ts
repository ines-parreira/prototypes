import type { NotificationData } from '../types'

export function isNotificationData(data: unknown): data is NotificationData {
    return (
        !!data &&
        typeof data === 'object' &&
        'type' in data &&
        data.type === 'notification.create'
    )
}
