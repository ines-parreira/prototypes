import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    evaluateFlag,
    getPrimaryEngineId,
    subscribeToFlag,
} from '../dualEvaluation'
import { ensureInitialization } from '../engines/launchdarkly'
import type { FeatureFlagKey } from '../featureFlagKey'
import { useFlagWithLoading } from '../useFlagWithLoading'

vi.mock('../dualEvaluation', () => ({
    evaluateFlag: vi.fn(),
    subscribeToFlag: vi.fn(),
    getPrimaryEngineId: vi.fn(),
}))

vi.mock('../engines/launchdarkly', () => ({
    ensureInitialization: vi.fn(),
}))

vi.mock('@splitsoftware/splitio-react', () => ({
    useTreatmentWithConfig: vi.fn(),
}))

const evaluateFlagMock = vi.mocked(evaluateFlag)
const subscribeToFlagMock = vi.mocked(subscribeToFlag)
const ensureInitializationMock = vi.mocked(ensureInitialization)
const useTreatmentWithConfigMock = vi.mocked(useTreatmentWithConfig)
const getPrimaryEngineIdMock = vi.mocked(getPrimaryEngineId)

const testFlag = 'test-flag' as FeatureFlagKey

type SplitMockState = {
    treatment: string
    config?: string | null
    isReady?: boolean
    isReadyFromCache?: boolean
    hasTimedout?: boolean
}

function mockHarnessHook(state: SplitMockState) {
    useTreatmentWithConfigMock.mockReturnValue({
        treatment: {
            treatment: state.treatment,
            config: state.config ?? null,
        },
        isReady: state.isReady ?? false,
        isReadyFromCache: state.isReadyFromCache ?? false,
        hasTimedout: state.hasTimedout ?? false,
        isTimedout: false,
        lastUpdate: 0,
        isDestroyed: false,
        factory: undefined,
        client: undefined,
    } as ReturnType<typeof useTreatmentWithConfig>)
}

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
        mockHarnessHook({ treatment: 'control' })
        getPrimaryEngineIdMock.mockReturnValue('launchdarkly')
    })

    describe('when LaunchDarkly is primary', () => {
        it('returns isLoading: true before initialization completes', () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.isLoading).toBe(true)
        })

        it('returns the flag value from evaluateFlag immediately', () => {
            evaluateFlagMock.mockReturnValue(true)

            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.value).toBe(true)
        })

        it('sets isLoading: false once initialization resolves', async () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            await act(async () => {
                initResolve()
                await initPromise
            })

            expect(result.current.isLoading).toBe(false)
        })

        it('updates the flag value once initialization resolves', async () => {
            evaluateFlagMock.mockReturnValue(false)
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            evaluateFlagMock.mockReturnValue(true)

            await act(async () => {
                initResolve()
                await initPromise
            })

            expect(result.current.value).toBe(true)
        })

        it('sets isLoading: false when initialization fails', async () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            await act(async () => {
                initReject(new Error('init failed'))
                await initPromise.catch(() => {})
            })

            expect(result.current.isLoading).toBe(false)
        })

        it('updates the value when the flag changes via subscription', () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            const [[, , onChange]] = subscribeToFlagMock.mock.calls

            act(() => {
                onChange(true)
            })

            expect(result.current.value).toBe(true)
        })

        it('unsubscribes when the hook is unmounted', () => {
            const { unmount } = renderHook(() => useFlagWithLoading(testFlag))

            unmount()

            expect(unsubscribe).toHaveBeenCalled()
        })

        it('does not re-subscribe when callers pass a fresh default each render', () => {
            const { rerender } = renderHook(
                ({ def }: { def: object }) => useFlagWithLoading(testFlag, def),
                { initialProps: { def: { a: 1 } } },
            )

            expect(subscribeToFlagMock).toHaveBeenCalledTimes(1)

            rerender({ def: { a: 1 } })
            rerender({ def: { a: 1 } })

            expect(subscribeToFlagMock).toHaveBeenCalledTimes(1)
        })
    })

    describe('when Harness is primary', () => {
        beforeEach(() => {
            getPrimaryEngineIdMock.mockReturnValue('harness')
        })

        it('returns isLoading: true before the Split SDK is ready', () => {
            mockHarnessHook({ treatment: 'control' })

            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.isLoading).toBe(true)
        })

        it('returns the default value while loading', () => {
            mockHarnessHook({ treatment: 'control' })

            const { result } = renderHook(() =>
                useFlagWithLoading(testFlag, true),
            )

            expect(result.current.value).toBe(true)
        })

        it('returns isLoading: false once the SDK is ready', () => {
            mockHarnessHook({ treatment: 'on', isReady: true })

            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.isLoading).toBe(false)
        })

        it('returns isLoading: false when the SDK is ready from cache', () => {
            mockHarnessHook({ treatment: 'on', isReadyFromCache: true })

            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.isLoading).toBe(false)
        })

        it('returns isLoading: false when the SDK times out', () => {
            mockHarnessHook({ treatment: 'control', hasTimedout: true })

            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.isLoading).toBe(false)
        })

        it('returns the treatment value once ready', () => {
            mockHarnessHook({ treatment: 'on', isReady: true })

            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.value).toBe(true)
        })
    })
})
