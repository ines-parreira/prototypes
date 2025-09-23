import { ldClientMock } from 'jest-launchdarkly-mock'

describe('ensureInitialization', () => {
    let initialisePromise: Promise<unknown>
    let initialiseResolve: (value?: unknown) => void

    beforeEach(() => {
        jest.clearAllMocks()

        // Clear any cached promises
        jest.resetModules()

        // Mock the module after resetModules
        jest.doMock('utils/launchDarkly', () => ({
            getLDClient: jest.fn().mockReturnValue(ldClientMock),
        }))

        initialisePromise = new Promise((resolve) => {
            initialiseResolve = resolve
        })
        ldClientMock.waitForInitialization.mockReturnValue(initialisePromise)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should call waitForInitialization on first call', async () => {
        const { ensureInitialization } = await import(
            '../launchDarklyInitialization'
        )
        const promise = ensureInitialization()

        expect(ldClientMock.waitForInitialization).toHaveBeenCalledTimes(1)
        expect(ldClientMock.waitForInitialization).toHaveBeenCalledWith(3)

        // Resolve the promise to complete the test
        initialiseResolve()
        await promise
    })

    it('should return the same promise on subsequent calls', async () => {
        const { ensureInitialization } = await import(
            '../launchDarklyInitialization'
        )
        const promise1 = ensureInitialization()
        const promise2 = ensureInitialization()
        const promise3 = ensureInitialization()

        expect(promise1).toBe(promise2)
        expect(promise2).toBe(promise3)
        expect(ldClientMock.waitForInitialization).toHaveBeenCalledTimes(1)

        // Resolve the promise to complete the test
        initialiseResolve()
        await promise1
    })

    it('should resolve when initialization succeeds', async () => {
        const { ensureInitialization } = await import(
            '../launchDarklyInitialization'
        )
        const promise = ensureInitialization()

        // Resolve the initialization
        initialiseResolve()

        await expect(promise).resolves.toBeUndefined()
    })

    it('should reject when initialization fails', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        ldClientMock.waitForInitialization.mockRejectedValue(
            new Error('Initialization failed'),
        )

        const { ensureInitialization } = await import(
            '../launchDarklyInitialization'
        )
        const promise = ensureInitialization()

        await expect(promise).rejects.toThrow('Initialization failed')
        expect(consoleSpy).toHaveBeenCalledWith(
            'Error during LaunchDarkly initialization',
            expect.any(Error),
        )

        consoleSpy.mockRestore()
    })

    it('should reset promise cache after failure and allow retry', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        // First call fails
        ldClientMock.waitForInitialization.mockRejectedValue(
            new Error('Initialization failed'),
        )

        const { ensureInitialization } = await import(
            '../launchDarklyInitialization'
        )
        const promise1 = ensureInitialization()
        await expect(promise1).rejects.toThrow('Initialization failed')

        // Second call should create a new promise
        const successPromise = new Promise((resolve) => {
            initialiseResolve = resolve
        })
        ldClientMock.waitForInitialization.mockReturnValue(successPromise)

        const promise2 = ensureInitialization()
        expect(promise1).not.toBe(promise2)
        expect(ldClientMock.waitForInitialization).toHaveBeenCalledTimes(2)

        // Resolve the second promise
        initialiseResolve()
        await promise2

        consoleSpy.mockRestore()
    })

    it('should handle multiple concurrent calls correctly', async () => {
        const { ensureInitialization } = await import(
            '../launchDarklyInitialization'
        )

        const promises = [
            ensureInitialization(),
            ensureInitialization(),
            ensureInitialization(),
            ensureInitialization(),
        ]

        expect(promises[0]).toBe(promises[1])
        expect(promises[1]).toBe(promises[2])
        expect(promises[2]).toBe(promises[3])

        expect(ldClientMock.waitForInitialization).toHaveBeenCalledTimes(1)

        // Resolve all promises
        initialiseResolve()
        await Promise.all(promises)
    })
})
