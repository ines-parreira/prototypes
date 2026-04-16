import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { evaluateFlag, subscribeToFlag } from '../dualEvaluation'
import { ensureInitialization } from '../engines/launchdarkly'
import type { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'

vi.mock('../dualEvaluation', () => ({
    evaluateFlag: vi.fn(),
    subscribeToFlag: vi.fn(),
}))

vi.mock('../engines/launchdarkly', () => ({
    ensureInitialization: vi.fn(),
}))

const evaluateFlagMock = vi.mocked(evaluateFlag)
const subscribeToFlagMock = vi.mocked(subscribeToFlag)
const ensureInitializationMock = vi.mocked(ensureInitialization)

const testFlag = 'test-flag' as FeatureFlagKey

describe('useFlag', () => {
    let initResolve: () => void
    let initPromise: Promise<void>
    let unsubscribe: () => void

    beforeEach(() => {
        vi.clearAllMocks()
        initPromise = new Promise<void>((resolve) => {
            initResolve = resolve
        })
        evaluateFlagMock.mockReturnValue(false)
        ensureInitializationMock.mockReturnValue(initPromise)
        unsubscribe = vi.fn<() => void>()
        subscribeToFlagMock.mockReturnValue(unsubscribe)
    })

    it('should return the value from evaluateFlag', () => {
        const { result } = renderHook(() => useFlag(testFlag))

        expect(result.current).toBe(false)
        expect(evaluateFlagMock).toHaveBeenCalledWith(testFlag, false)
    })

    it('should set the value once initialization completes', async () => {
        evaluateFlagMock.mockReturnValue(false)

        const { result } = renderHook(() => useFlag(testFlag))
        expect(result.current).toBe(false)

        evaluateFlagMock.mockReturnValue(true)

        await act(async () => {
            initResolve()
            await initPromise
        })

        expect(result.current).toBe(true)
    })

    it('should subscribe to flag changes', () => {
        renderHook(() => useFlag(testFlag))

        expect(subscribeToFlagMock).toHaveBeenCalledWith(
            testFlag,
            false,
            expect.any(Function),
        )
    })

    it('should update value when flag changes via subscription', () => {
        const { result } = renderHook(() => useFlag(testFlag))

        const [[, , onChange]] = subscribeToFlagMock.mock.calls

        act(() => {
            onChange(true)
        })

        expect(result.current).toBe(true)
    })

    it('should unsubscribe when the hook is unmounted', () => {
        const { unmount } = renderHook(() => useFlag(testFlag))

        unmount()

        expect(unsubscribe).toHaveBeenCalled()
    })

    it('should handle initialization error gracefully', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const initError = new Error('init failed')
        ensureInitializationMock.mockRejectedValue(initError)

        const { result } = renderHook(() => useFlag(testFlag))

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error fetching feature flag',
                initError,
            )
        })

        expect(result.current).toBe(false)
        consoleSpy.mockRestore()
    })

    it('should return default value when flag cannot be fetched', () => {
        const defaultValue = true
        evaluateFlagMock.mockReturnValue(defaultValue)
        const { result } = renderHook(() => useFlag(testFlag, defaultValue))

        expect(result.current).toBe(defaultValue)
    })
})
