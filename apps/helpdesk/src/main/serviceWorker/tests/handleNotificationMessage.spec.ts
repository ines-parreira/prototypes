import { handleNotificationMessage } from '../handleNotificationMessage'
import { shouldSendNotification } from '../helpers/shouldSendNotification'
import type { NotificationData } from '../types'

declare const self: ServiceWorkerGlobalScope

jest.mock('../helpers/shouldSendNotification', () => ({
    shouldSendNotification: jest.fn(),
}))

const shouldSendNotificationMock = shouldSendNotification as jest.Mock

describe('handleNotificationMessage', () => {
    const notification = {
        type: 'notification.create',
        payload: {
            id: 'n123',
            title: 'title',
            description: 'description',
        },
    } as NotificationData

    let matchAll: jest.Mock
    let showNotification: jest.Mock

    beforeEach(() => {
        matchAll = jest.fn()
        matchAll.mockReturnValue([{ frameType: 'top-level', focused: false }])
        // @ts-expect-error
        self.clients = { matchAll }

        showNotification = jest.fn()
        // @ts-expect-error
        self.registration = { showNotification }

        shouldSendNotificationMock.mockResolvedValue(true)
    })

    it('should do nothing if there are focused windows', async () => {
        matchAll.mockReturnValue([{ frameType: 'top-level', focused: true }])
        await handleNotificationMessage(notification)

        expect(showNotification).not.toHaveBeenCalled()
    })

    it('should do nothing if the notification was already sent', async () => {
        shouldSendNotificationMock.mockResolvedValue(false)
        await handleNotificationMessage(notification)

        expect(showNotification).not.toHaveBeenCalled()
    })

    it('should send a notification', async () => {
        await handleNotificationMessage(notification)

        expect(showNotification).toHaveBeenCalledWith('title', {
            body: 'description',
            icon: '',
            data: { id: 'n123' },
        })
    })
})
