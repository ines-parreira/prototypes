describe('initServiceWorker', () => {
    let register: jest.Mock

    beforeEach(() => {
        jest.resetModules()

        register = jest.fn()
        // @ts-expect-error readonly, but doesn't exist in jsdom
        navigator.serviceWorker = { register }
    })

    it('should register the service worker with the build url', () => {
        window.SERVICE_WORKER_BUILD_URL = 'helpdesk.service-worker.build.js'
        require('../initServiceWorker')

        expect(register).toHaveBeenCalledWith(
            'helpdesk.service-worker.build.js',
        )
    })

    it('should register the service worker with the fallback url', () => {
        window.SERVICE_WORKER_BUILD_URL = ''
        require('../initServiceWorker')

        expect(register).toHaveBeenCalledWith(
            '/web-app/build/helpdesk.service-worker.a.js',
        )
    })
})
