import {renderHook} from '@testing-library/react-hooks'

import {getLDClient} from 'utils/launchDarkly'

import useLaunchDarklyClient from '../useLaunchDarklyClient'

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
}))

describe('useLaunchDarklyClient', () => {
    let mockWaitForInitialization: jest.Mock
    let mockLDClient: {waitForInitialization: jest.Mock}
    beforeEach(() => {
        jest.resetAllMocks()
        mockWaitForInitialization = jest.fn().mockResolvedValueOnce(undefined)
        mockLDClient = {
            waitForInitialization: mockWaitForInitialization,
        }
        ;(getLDClient as jest.Mock).mockReturnValue(mockLDClient)
    })

    it('should initialize LaunchDarkly client and set the state correctly', async () => {
        const {result, waitForNextUpdate} = renderHook(() =>
            useLaunchDarklyClient()
        )

        expect(result.current.ldClient).toBeNull()
        expect(result.current.isLdInitialized).toBe(false)

        await waitForNextUpdate()

        expect(result.current.ldClient).toBe(mockLDClient)
        expect(result.current.isLdInitialized).toBe(true)
        expect(mockWaitForInitialization).toHaveBeenCalled()
    })

    it('should not set state if LaunchDarkly client is null', () => {
        ;(getLDClient as jest.Mock).mockReturnValue(null)

        const {result} = renderHook(() => useLaunchDarklyClient())

        expect(result.current.ldClient).toBeNull()
        expect(result.current.isLdInitialized).toBe(false)
    })
})
