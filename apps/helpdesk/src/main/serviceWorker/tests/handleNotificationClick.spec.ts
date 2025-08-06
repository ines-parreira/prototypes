import { handleNotificationClick } from '../handleNotificationClick'

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

    it('should do nothing if there are no clients to focus', async () => {
        matchAll.mockReturnValue([])
        await handleNotificationClick()
    })

    it('should focus the first client in the list', async () => {
        const focus = jest.fn()
        matchAll.mockReturnValue([{ frameType: 'top-level', focus }])
        await handleNotificationClick()

        expect(focus).toHaveBeenCalled()
    })
})
