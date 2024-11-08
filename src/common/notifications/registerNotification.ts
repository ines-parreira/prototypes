import {categories, notifications} from './data'
import type {NotificationConfig} from './types'

export default function registerNotification(config: NotificationConfig) {
    notifications[config.type] = config
    if (!config.settings) return

    const category = categories.find((c) => c.type === config.settings?.type)
    if (!category) return

    if (!category.notifications) {
        category.notifications = []
    }

    category.notifications.push(config.type)
}
