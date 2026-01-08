import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ensureInitialization } from '../launchDarklyInitialization'
import { useAreFlagsLoading } from '../useAreFlagsLoading'

vi.mock('../launchDarklyInitialization', () => ({
    ensureInitialization: vi.fn(),
}))

const ensureInitializationMock = vi.mocked(ensureInitialization)

describe('useAreFlagsLoading', () => {
    let initialisePromise: Promise<unknown>
    let initialiseResolve: (value?: unknown) => void

    beforeEach(() => {
        initialisePromise = new Promise((resolve) => {
            initialiseResolve = resolve
        })

        ensureInitializationMock.mockReturnValue(
            initialisePromise as Promise<void>,
        )
    })

    afterEach(() => {
        vi.clearAllMocks()
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
        const consoleSpy = vi
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
