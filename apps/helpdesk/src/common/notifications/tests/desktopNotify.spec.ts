import { desktopNotify } from '../desktopNotify'

describe('desktopNotify', () => {
    it('should do nothing if there is no service worker api', () => {
        // @ts-expect-error
        delete navigator.serviceWorker
        desktopNotify('id', 'title', 'description')
    })

    it('should do nothing if there is no registered service worker', () => {
        // @ts-expect-error
        navigator.serviceWorker = {}
        desktopNotify('id', 'title', 'description')
    })

    it('should send a notification if there is a registered service worker', () => {
        const postMessage = jest.fn()
        // @ts-expect-error
        navigator.serviceWorker = { controller: { postMessage } }
        desktopNotify('id', 'title', 'description')

        expect(postMessage).toHaveBeenCalledWith({
            type: 'notification.create',
            payload: { id: 'id', title: 'title', description: 'description' },
        })
    })
})
