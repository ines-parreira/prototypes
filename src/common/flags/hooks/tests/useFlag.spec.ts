import {act, renderHook} from '@testing-library/react-hooks'
import {ldClientMock} from 'jest-launchdarkly-mock'

import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'

import useFlag from '../useFlag'

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
}))

const getLDClientMock = getLDClient as jest.Mock

const testFlag = 'test-flag' as FeatureFlagKey

describe('useFlag', () => {
    let initialisePromise: Promise<unknown>
    let initialiseResolve: (value?: unknown) => void

    beforeEach(() => {
        initialisePromise = new Promise((resolve) => {
            initialiseResolve = resolve
        })
        ldClientMock.variation.mockReturnValue(false)
        ldClientMock.waitForInitialization.mockReturnValue(initialisePromise)
        getLDClientMock.mockReturnValue(ldClientMock)
    })

    it('should return the value from the client', () => {
        const {result} = renderHook(() => useFlag(testFlag, false))

        expect(result.current).toBe(false)
    })

    it('should set the value once client initialisation completes', async () => {
        ldClientMock.variation.mockReturnValue(false)

        const {result} = renderHook(() => useFlag(testFlag, false))
        expect(result.current).toBe(false)

        ldClientMock.variation.mockReturnValue(true)

        await act(async () => {
            initialiseResolve()
            await initialisePromise
        })

        expect(result.current).toBe(true)
    })

    it('should listen for updates to the given flag', () => {
        const {result} = renderHook(() => useFlag(testFlag, false))

        expect(ldClientMock.on).toHaveBeenCalledWith(
            `change:${testFlag}`,
            expect.any(Function)
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
        const {unmount} = renderHook(() => useFlag(testFlag, false))

        const [[, onChange]] = ldClientMock.on.mock.calls
        unmount()

        expect(ldClientMock.off).toHaveBeenCalledWith(
            `change:${testFlag}`,
            onChange
        )
    })
})
