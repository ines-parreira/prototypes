import { registerNotifications } from '../notifications'

declare const self: ServiceWorkerGlobalScope

describe('registerNotifictions', () => {
    let addEventListener: jest.SpyInstance
    let matchAll: jest.Mock
    let showNotification: jest.Mock

    beforeEach(() => {
        addEventListener = jest.spyOn(self, 'addEventListener')

        matchAll = jest.fn()
        matchAll.mockReturnValue([])
        // @ts-expect-error
        self.clients = { matchAll }

        showNotification = jest.fn()
        // @ts-expect-error
        self.registration = { showNotification }
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
        cb({})

        expect(showNotification).not.toHaveBeenCalled()
    })

    it('should do nothing if there are focused windows', () => {
        matchAll.mockReturnValue([{ frameType: 'top-level', focused: true }])
        registerNotifications()
        const [[, cb]] = addEventListener.mock.calls
        cb({ data: { type: 'notification.create' } })

        expect(showNotification).not.toHaveBeenCalled()
    })

    it('should send a notification', async () => {
        matchAll.mockReturnValue([{ frameType: 'top-level', focused: false }])
        registerNotifications()
        const [[, cb]] = addEventListener.mock.calls
        await cb({
            data: {
                type: 'notification.create',
                payload: {
                    id: 'n123',
                    title: 'title',
                    description: 'description',
                },
            },
        })

        expect(showNotification).toHaveBeenCalledWith('title', {
            body: 'description',
            icon: '',
            data: { id: 'n123' },
        })
    })
})
