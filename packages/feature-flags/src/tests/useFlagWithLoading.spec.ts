import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { evaluateFlag, subscribeToFlag } from '../dualEvaluation'
import { ensureInitialization } from '../engines/launchdarkly'
import type { FeatureFlagKey } from '../featureFlagKey'
import { useFlagWithLoading } from '../useFlagWithLoading'

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

describe('useFlagWithLoading', () => {
    let initResolve: () => void
    let initReject: (error: Error) => void
    let initPromise: Promise<void>
    let unsubscribe: () => void

    beforeEach(() => {
        vi.clearAllMocks()
        initPromise = new Promise<void>((resolve, reject) => {
            initResolve = resolve
            initReject = reject
        })
        evaluateFlagMock.mockReturnValue(false)
        ensureInitializationMock.mockReturnValue(initPromise)
        unsubscribe = vi.fn<() => void>()
        subscribeToFlagMock.mockReturnValue(unsubscribe)
    })

    describe('initial state', () => {
        it('should return isLoading: true before initialization completes', () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.isLoading).toBe(true)
        })

        it('should return the flag value from evaluateFlag immediately', () => {
            evaluateFlagMock.mockReturnValue(true)

            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.value).toBe(true)
        })

        it('should use the provided default value', () => {
            evaluateFlagMock.mockReturnValue(true)

            const { result } = renderHook(() =>
                useFlagWithLoading(testFlag, true),
            )

            expect(result.current.value).toBe(true)
        })
    })

    describe('after initialization', () => {
        it('should set isLoading: false once initialization resolves', async () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            await act(async () => {
                initResolve()
                await initPromise
            })

            expect(result.current.isLoading).toBe(false)
        })

        it('should update the flag value once initialization resolves', async () => {
            evaluateFlagMock.mockReturnValue(false)
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            evaluateFlagMock.mockReturnValue(true)

            await act(async () => {
                initResolve()
                await initPromise
            })

            expect(result.current.value).toBe(true)
        })

        it('should set isLoading: false when initialization fails', async () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            await act(async () => {
                initReject(new Error('init failed'))
                await initPromise.catch(() => {})
            })

            expect(result.current.isLoading).toBe(false)
        })

        it('should keep the initial flag value when initialization fails', async () => {
            evaluateFlagMock.mockReturnValue(true)
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            await act(async () => {
                initReject(new Error('init failed'))
                await initPromise.catch(() => {})
            })

            expect(result.current.value).toBe(true)
        })
    })

    describe('flag change subscription', () => {
        it('should subscribe to flag changes', () => {
            renderHook(() => useFlagWithLoading(testFlag))

            expect(subscribeToFlagMock).toHaveBeenCalledWith(
                testFlag,
                false,
                expect.any(Function),
            )
        })

        it('should update the value when the flag changes', () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            const [[, , onChange]] = subscribeToFlagMock.mock.calls

            act(() => {
                onChange(true)
            })

            expect(result.current.value).toBe(true)
        })

        it('should unsubscribe when the hook is unmounted', () => {
            const { unmount } = renderHook(() => useFlagWithLoading(testFlag))

            unmount()

            expect(unsubscribe).toHaveBeenCalled()
        })
    })
})
