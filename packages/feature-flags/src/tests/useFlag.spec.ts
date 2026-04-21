import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    evaluateFlag,
    getPrimaryEngineId,
    subscribeToFlag,
} from '../dualEvaluation'
import { ensureInitialization } from '../engines/launchdarkly'
import type { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'

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

function mockHarnessTreatment(treatment: string, config: string | null = null) {
    useTreatmentWithConfigMock.mockReturnValue({
        treatment: { treatment, config },
        isReady: true,
        isReadyFromCache: true,
        hasTimedout: false,
        isTimedout: false,
        lastUpdate: 0,
        isDestroyed: false,
        factory: undefined,
        client: undefined,
    } as ReturnType<typeof useTreatmentWithConfig>)
}

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
        mockHarnessTreatment('control')
        // Default to LD primary unless a test overrides it.
        getPrimaryEngineIdMock.mockReturnValue('launchdarkly')
    })

    describe('when LaunchDarkly is primary', () => {
        it('returns the value from evaluateFlag', () => {
            evaluateFlagMock.mockReturnValue(true)

            const { result } = renderHook(() => useFlag(testFlag))

            expect(result.current).toBe(true)
            expect(evaluateFlagMock).toHaveBeenCalledWith(testFlag, false)
        })

        it('updates the value once initialization completes', async () => {
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

        it('subscribes to flag changes', () => {
            renderHook(() => useFlag(testFlag))

            expect(subscribeToFlagMock).toHaveBeenCalledWith(
                testFlag,
                false,
                expect.any(Function),
            )
        })

        it('updates the value when the flag changes via subscription', () => {
            const { result } = renderHook(() => useFlag(testFlag))

            const [[, , onChange]] = subscribeToFlagMock.mock.calls

            act(() => {
                onChange(true)
            })

            expect(result.current).toBe(true)
        })

        it('unsubscribes when the hook is unmounted', () => {
            const { unmount } = renderHook(() => useFlag(testFlag))

            unmount()

            expect(unsubscribe).toHaveBeenCalled()
        })

        it('handles initialization errors gracefully', async () => {
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

        it('does not re-subscribe when callers pass a fresh default object each render', () => {
            const { rerender } = renderHook(
                ({ def }: { def: object }) => useFlag(testFlag, def),
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

        it('returns true when the Split treatment is on', () => {
            mockHarnessTreatment('on')

            const { result } = renderHook(() => useFlag(testFlag))

            expect(result.current).toBe(true)
        })

        it('returns false when the Split treatment is off', () => {
            mockHarnessTreatment('off')

            const { result } = renderHook(() => useFlag(testFlag))

            expect(result.current).toBe(false)
        })

        it('returns the default value when the Split treatment is control', () => {
            mockHarnessTreatment('control')

            const { result } = renderHook(() => useFlag(testFlag, true))

            expect(result.current).toBe(true)
        })

        it('parses JSON config when provided', () => {
            mockHarnessTreatment('on', '{"foo":"bar"}')

            const { result } = renderHook(() =>
                useFlag<{ foo: string }>(testFlag, { foo: 'default' }),
            )

            expect(result.current).toEqual({ foo: 'bar' })
        })

        it('normalizes flag ids with dots before passing to Split', () => {
            mockHarnessTreatment('on')
            const dottedFlag = 'linear.project.feature' as FeatureFlagKey

            renderHook(() => useFlag(dottedFlag))

            expect(useTreatmentWithConfigMock).toHaveBeenCalledWith({
                name: 'linear-project-feature',
            })
        })
    })
})
