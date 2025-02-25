import { categories, notifications } from '../data'
import registerCategory from '../registerCategory'
import registerNotification from '../registerNotification'
import type { CategoryConfig, NotificationConfig } from '../types'

jest.mock('../data', () => ({
    categories: [],
    notifications: {},
}))

describe('registerNotification', () => {
    it('should register a notification', () => {
        registerNotification({ type: 'notification-1' } as NotificationConfig)
        expect(notifications['notification-1']).toEqual({
            type: 'notification-1',
        })
    })

    it('should not add the notification to a settings category if it does not exist', () => {
        registerNotification({
            type: 'notification-2',
            settings: { type: 'category-2' },
        } as NotificationConfig)

        expect(categories.find((c) => c.type === 'category-2')).toBe(undefined)
    })

    it('should add the notification to the correct settings category', () => {
        registerCategory({ type: 'category-3' } as CategoryConfig)

        expect(categories.find((c) => c.type === 'category-3')).toEqual({
            type: 'category-3',
        })

        registerNotification({
            type: 'notification-3',
            settings: { type: 'category-3' },
        } as NotificationConfig)

        expect(categories.find((c) => c.type === 'category-3')).toEqual({
            type: 'category-3',
            notifications: ['notification-3'],
        })
        expect(notifications['notification-3']).toEqual({
            type: 'notification-3',
            settings: { type: 'category-3' },
        })
    })
})
