import { getLDClient } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { ldClientMock } from 'jest-launchdarkly-mock'

import useAreFlagsLoading from '../useAreFlagsLoading'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    getLDClient: jest.fn(),
}))

jest.mock('../../utils/launchDarklyInitialization', () => ({
    ensureInitialization: jest.fn(),
}))

const getLDClientMock = getLDClient as jest.Mock

describe('useAreFlagsLoading', () => {
    let initialisePromise: Promise<unknown>
    let initialiseResolve: (value?: unknown) => void
    let ensureInitializationMock: jest.Mock

    beforeEach(() => {
        // Import the mocked function
        const {
            ensureInitialization,
        } = require('../../utils/launchDarklyInitialization')
        ensureInitializationMock = ensureInitialization as jest.Mock

        initialisePromise = new Promise((resolve) => {
            initialiseResolve = resolve
        })

        // Mock the shared initialization function
        ensureInitializationMock.mockReturnValue(initialisePromise)

        ldClientMock.waitForInitialization.mockReturnValue(initialisePromise)
        getLDClientMock.mockReturnValue(ldClientMock)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return true initially', () => {
        const { result } = renderHook(() => useAreFlagsLoading())

        expect(result.current).toBe(true)
    })

    it('should return false after initialization completes', async () => {
        const { result } = renderHook(() => useAreFlagsLoading())

        expect(result.current).toBe(true)

        await act(async () => {
            initialiseResolve()
            await initialisePromise
        })

        expect(result.current).toBe(false)
    })

    it('should return false even if initialization fails', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        const failedPromise = Promise.reject(new Error('Initialization failed'))
        ensureInitializationMock.mockReturnValue(failedPromise)

        const { result } = renderHook(() => useAreFlagsLoading())

        expect(result.current).toBe(true)

        await act(async () => {
            await failedPromise.catch(() => {})
        })

        expect(result.current).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith(
            'Error waiting for flags to be ready',
            expect.any(Error),
        )

        consoleSpy.mockRestore()
    })

    it('should only run once per component instance', () => {
        const { rerender } = renderHook(() => useAreFlagsLoading())

        expect(ensureInitializationMock).toHaveBeenCalledTimes(1)

        rerender()
        rerender()
        rerender()

        expect(ensureInitializationMock).toHaveBeenCalledTimes(1)
    })
})
