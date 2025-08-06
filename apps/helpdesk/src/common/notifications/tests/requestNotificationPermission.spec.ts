import { requestNotificationPermission } from '../requestNotificationPermission'

describe('requestNotificationPermission', () => {
    it('should resolve to true if permission was already granted', async () => {
        global.Notification = { permission: 'granted' } as typeof Notification
        const hasPermission = await requestNotificationPermission()

        expect(hasPermission).toBe(true)
    })

    it('should resolve to false if permission was already denied', async () => {
        global.Notification = { permission: 'denied' } as typeof Notification
        const hasPermission = await requestNotificationPermission()

        expect(hasPermission).toBe(false)
    })

    it('should request permission if not yet done and resolve true if granted', async () => {
        const requestPermission = jest.fn(() => 'granted')
        global.Notification = {
            permission: 'default',
            requestPermission,
        } as unknown as typeof Notification
        const hasPermission = await requestNotificationPermission()

        expect(hasPermission).toBe(true)
    })

    it('should request permission if not yet done and resolve false if denied', async () => {
        const requestPermission = jest.fn(() => 'denied')
        global.Notification = {
            permission: 'default',
            requestPermission,
        } as unknown as typeof Notification
        const hasPermission = await requestNotificationPermission()

        expect(hasPermission).toBe(false)
    })
})
