import type {CategoryConfig, Channel, NotificationConfig} from './types'

export const channels: Channel[] = [
    {
        type: 'in_app_feed',
        label: 'Browser',
    },
]

export const categories: CategoryConfig[] = []

export const notifications: Record<string, NotificationConfig<any>> = {}
