import { handleNotificationMessage } from '../handleNotificationMessage'
import type { NotificationData } from '../types'

declare const self: ServiceWorkerGlobalScope

describe('handleNotificationMessage', () => {
    let matchAll: jest.Mock
    let showNotification: jest.Mock

    beforeEach(() => {
        matchAll = jest.fn()
        matchAll.mockReturnValue([])
        // @ts-expect-error
        self.clients = { matchAll }

        showNotification = jest.fn()
        // @ts-expect-error
        self.registration = { showNotification }
    })

    it('should do nothing if there are focused windows', async () => {
        matchAll.mockReturnValue([{ frameType: 'top-level', focused: true }])
        await handleNotificationMessage({
            type: 'notification.create',
        } as NotificationData)

        expect(showNotification).not.toHaveBeenCalled()
    })

    it('should send a notification', async () => {
        matchAll.mockReturnValue([{ frameType: 'top-level', focused: false }])
        await handleNotificationMessage({
            type: 'notification.create',
            payload: {
                id: 'n123',
                title: 'title',
                description: 'description',
            },
        })

        expect(showNotification).toHaveBeenCalledWith('title', {
            body: 'description',
            icon: '',
            data: { id: 'n123' },
        })
    })
})
