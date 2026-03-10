import { act, renderHook } from '@testing-library/react'
import type { LDClient } from 'launchdarkly-js-client-sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

import type { FeatureFlagKey } from '../featureFlagKey'
import { getLDClient } from '../launchdarkly'
import { ensureInitialization } from '../launchDarklyInitialization'
import { useFlagWithLoading } from '../useFlagWithLoading'

type FlagChangeHandler = (value: boolean) => void

type MockLDClient = LDClient & {
    on: Mock<(event: string, handler: FlagChangeHandler) => void>
    off: Mock<(event: string, handler: FlagChangeHandler) => void>
    variation: Mock<(key: string, defaultValue: boolean) => boolean>
}

const createLDClientMock = (): MockLDClient =>
    ({
        track: vi.fn(),
        identify: vi.fn(),
        allFlags: vi.fn(),
        close: vi.fn(),
        flush: vi.fn(),
        getContext: vi.fn(),
        off: vi.fn<(event: string, handler: FlagChangeHandler) => void>(),
        on: vi.fn<(event: string, handler: FlagChangeHandler) => void>(),
        setStreaming: vi.fn(),
        variation: vi.fn<(key: string, defaultValue: boolean) => boolean>(),
        variationDetail: vi.fn(),
        waitForInitialization: vi.fn(),
        waitUntilGoalsReady: vi.fn(),
        waitUntilReady: vi.fn(),
    }) as unknown as MockLDClient

vi.mock('../launchdarkly', () => ({
    getLDClient: vi.fn(),
}))

vi.mock('../launchDarklyInitialization', () => ({
    ensureInitialization: vi.fn(),
}))

const getLDClientMock = vi.mocked(getLDClient)
const ensureInitializationMock = vi.mocked(ensureInitialization)

const testFlag = 'test-flag' as FeatureFlagKey

describe('useFlagWithLoading', () => {
    let ldClientMock: MockLDClient
    let initResolve: () => void
    let initReject: (error: Error) => void
    let initPromise: Promise<void>

    beforeEach(() => {
        ldClientMock = createLDClientMock()
        initPromise = new Promise<void>((resolve, reject) => {
            initResolve = resolve
            initReject = reject
        })
        ldClientMock.variation.mockReturnValue(false)
        ensureInitializationMock.mockReturnValue(initPromise)
        getLDClientMock.mockReturnValue(ldClientMock)
    })

    describe('initial state', () => {
        it('should return isLoading: true before initialization completes', () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.isLoading).toBe(true)
        })

        it('should return the flag value from the client immediately', () => {
            ldClientMock.variation.mockReturnValue(true)

            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            expect(result.current.value).toBe(true)
        })

        it('should use the provided default value', () => {
            ldClientMock.variation.mockReturnValue(true)

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
            ldClientMock.variation.mockReturnValue(false)
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            ldClientMock.variation.mockReturnValue(true)

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
            ldClientMock.variation.mockReturnValue(true)
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            await act(async () => {
                initReject(new Error('init failed'))
                await initPromise.catch(() => {})
            })

            expect(result.current.value).toBe(true)
        })
    })

    describe('flag change subscription', () => {
        it('should listen for updates to the given flag', () => {
            renderHook(() => useFlagWithLoading(testFlag))

            expect(ldClientMock.on).toHaveBeenCalledWith(
                `change:${testFlag}`,
                expect.any(Function),
            )
        })

        it('should update the value when the flag changes', () => {
            const { result } = renderHook(() => useFlagWithLoading(testFlag))

            const [[, onChange]] = ldClientMock.on.mock.calls

            act(() => {
                onChange(true)
            })

            expect(result.current.value).toBe(true)
        })

        it('should stop listening for updates when the hook is unmounted', () => {
            const { unmount } = renderHook(() => useFlagWithLoading(testFlag))

            const [[, onChange]] = ldClientMock.on.mock.calls
            unmount()

            expect(ldClientMock.off).toHaveBeenCalledWith(
                `change:${testFlag}`,
                onChange,
            )
        })
    })
})
