import { FeatureFlagKey } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { ldClientMock } from 'jest-launchdarkly-mock'

import { getLDClient } from 'utils/launchDarkly'

import useAreFlagsLoading from '../useAreFlagsLoading'
import useFlag from '../useFlag'

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
}))

jest.mock('../useAreFlagsLoading')
const useAreFlagsLoadingMock = jest.mocked(useAreFlagsLoading)

const getLDClientMock = getLDClient as jest.Mock

const testFlag = 'test-flag' as FeatureFlagKey

describe('useFlag', () => {
    beforeEach(() => {
        ldClientMock.variation.mockReturnValue(false)
        useAreFlagsLoadingMock.mockReturnValue(true) // Start with flags loading
        getLDClientMock.mockReturnValue(ldClientMock)
    })

    it('should return the value from the client', () => {
        const { result } = renderHook(() => useFlag(testFlag))

        expect(result.current).toBe(false)
    })

    it('should set the value once flags are ready', async () => {
        ldClientMock.variation.mockReturnValue(false)

        const { result, rerender } = renderHook(() => useFlag(testFlag))
        expect(result.current).toBe(false)

        ldClientMock.variation.mockReturnValue(true)
        useAreFlagsLoadingMock.mockReturnValue(false)

        await act(async () => {
            rerender()
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
