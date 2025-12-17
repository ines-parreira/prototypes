import { act, renderHook } from '@testing-library/react'
import type { LDClient } from 'launchdarkly-js-client-sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FeatureFlagKey } from '../featureFlagKey'
import { getLDClient } from '../launchdarkly'
import { useFlag } from '../useFlag'

const createLDClientMock = () => {
    const mock = {
        track: vi.fn(),
        identify: vi.fn(),
        allFlags: vi.fn(),
        close: vi.fn(),
        flush: vi.fn(),
        getContext: vi.fn(),
        off: vi.fn(),
        on: vi.fn(),
        setStreaming: vi.fn(),
        variation: vi.fn(),
        variationDetail: vi.fn(),
        waitForInitialization: vi.fn(),
        waitUntilGoalsReady: vi.fn(),
        waitUntilReady: vi.fn(),
    }
    return mock
}

vi.mock('../launchdarkly', () => ({
    getLDClient: vi.fn(),
}))

const getLDClientMock = vi.mocked(getLDClient)

const testFlag = 'test-flag' as FeatureFlagKey

describe('useFlag', () => {
    let ldClientMock: ReturnType<typeof createLDClientMock>
    let initialisePromise: Promise<unknown>
    let initialiseResolve: (value?: unknown) => void

    beforeEach(() => {
        ldClientMock = createLDClientMock()
        initialisePromise = new Promise((resolve) => {
            initialiseResolve = resolve
        })
        ldClientMock.variation.mockReturnValue(false)
        ldClientMock.waitForInitialization.mockReturnValue(
            initialisePromise as Promise<void>,
        )
        getLDClientMock.mockReturnValue(ldClientMock as unknown as LDClient)
    })

    it('should return the value from the client', () => {
        const { result } = renderHook(() => useFlag(testFlag))

        expect(result.current).toBe(false)
    })

    it('should set the value once client initialization completes', async () => {
        ldClientMock.variation.mockReturnValue(false)

        const { result } = renderHook(() => useFlag(testFlag))
        expect(result.current).toBe(false)

        ldClientMock.variation.mockReturnValue(true)

        await act(async () => {
            initialiseResolve()
            await initialisePromise
        })

        expect(result.current).toBe(true)
    })

    it('should listen for updates to the given flag', () => {
        const { result } = renderHook(() => useFlag(testFlag))

        expect(ldClientMock.on).toHaveBeenCalledWith(
            `change:${testFlag}`,
            expect.any(Function),
        )

        const [[, onChange]] = ldClientMock.on.mock.calls as [
            [string, (newValue: boolean) => void],
        ]

        act(() => {
            onChange(true)
        })

        expect(result.current).toBe(true)
    })

    it('should stop listening for updates when the hook is unmounted', () => {
        const { unmount } = renderHook(() => useFlag(testFlag))

        const [[, onChange]] = ldClientMock.on.mock.calls
        unmount()

        expect(ldClientMock.off).toHaveBeenCalledWith(
            `change:${testFlag}`,
            onChange,
        )
    })

    it('should return default value when flag cannot be fetched', () => {
        const defaultValue = true
        ldClientMock.variation.mockReturnValue(defaultValue)
        const { result } = renderHook(() => useFlag(testFlag, defaultValue))

        expect(result.current).toBe(defaultValue)
    })
})
