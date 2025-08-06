import { registerNotifications } from '../notifications'

declare const self: ServiceWorkerGlobalScope

jest.mock('../handleNotificationClick', () => ({
    handleNotificationClick: jest.fn(),
}))

jest.mock('../handleNotificationMessage', () => ({
    handleNotificationMessage: jest.fn(),
}))

describe('registerNotifictions', () => {
    let addEventListener: jest.SpyInstance

    beforeEach(() => {
        addEventListener = jest.spyOn(self, 'addEventListener')
    })

    it('should register a message handler', () => {
        registerNotifications()
        expect(addEventListener).toHaveBeenCalledWith(
            'message',
            expect.any(Function),
        )
    })

    it('should do nothing if the event is not a notification', () => {
        registerNotifications()
        const [[, cb]] = addEventListener.mock.calls
        const waitUntil = jest.fn()
        cb({ waitUntil })

        expect(waitUntil).not.toHaveBeenCalled()
    })

    it('should send a notification', async () => {
        registerNotifications()
        const [[, cb]] = addEventListener.mock.calls
        const waitUntil = jest.fn()
        await cb({
            data: {
                type: 'notification.create',
                payload: {
                    id: 'n123',
                    title: 'title',
                    description: 'description',
                },
            },
            waitUntil,
        })

        expect(waitUntil).toHaveBeenCalled()
    })

    it('should register a notificationclick handler', () => {
        registerNotifications()
        expect(addEventListener).toHaveBeenCalledWith(
            'notificationclick',
            expect.any(Function),
        )
    })

    it('should handle notification clicks', () => {
        registerNotifications()
        const [, [, cb]] = addEventListener.mock.calls
        const close = jest.fn()
        const preventDefault = jest.fn()
        const waitUntil = jest.fn()
        cb({ notification: { close }, preventDefault, waitUntil })

        expect(close).toHaveBeenCalled()
        expect(preventDefault).toHaveBeenCalled()
        expect(waitUntil).toHaveBeenCalled()
    })
})
