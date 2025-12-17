import { FeatureFlagKey, getLDClient } from '@repo/feature-flags'
import { ldClientMock } from 'jest-launchdarkly-mock'

import { fetchFlag } from 'core/flags/fetchFlag'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    getLDClient: jest.fn(),
}))

const getLDClientMock = getLDClient as jest.Mock

describe('fetchFlag', () => {
    const testFlag = FeatureFlagKey.ReportingP1MetricMigration
    let initialisePromise: Promise<unknown>

    beforeEach(() => {
        jest.clearAllMocks()
        initialisePromise = Promise.resolve()
        ldClientMock.variation.mockReturnValue(false)
        ldClientMock.waitForInitialization.mockReturnValue(initialisePromise)
        getLDClientMock.mockReturnValue(ldClientMock)
    })

    it('should return the flag value from the client when successful', async () => {
        const expectedValue = 'shadow'
        ldClientMock.variation.mockReturnValue(expectedValue)

        const result = await fetchFlag(testFlag, 'off')

        expect(getLDClientMock).toHaveBeenCalled()
        expect(ldClientMock.waitForInitialization).toHaveBeenCalledWith(3)
        expect(ldClientMock.variation).toHaveBeenCalledWith(testFlag, 'off')
        expect(result.flag).toBe(expectedValue)
        expect(result.error).toBeNull()
    })

    it('should return the default value when flag is not set', async () => {
        const defaultValue = 'off'
        ldClientMock.variation.mockReturnValue(defaultValue)

        const result = await fetchFlag(testFlag, defaultValue)

        expect(result.flag).toBe(defaultValue)
        expect(result.error).toBeNull()
    })

    it('should return default value and error when initialization fails', async () => {
        const defaultValue = 'off'
        const error = new Error('Initialization failed')
        ldClientMock.waitForInitialization.mockRejectedValue(error)
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation()

        const result = await fetchFlag(testFlag, defaultValue)

        expect(result.flag).toBe(defaultValue)
        expect(result.error).toBe(error)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error fetching feature flag'),
            error,
        )

        consoleErrorSpy.mockRestore()
    })

    it('should return default value and error when variation throws', async () => {
        const defaultValue = 'off'
        const error = new Error('Variation failed')
        ldClientMock.variation.mockImplementation(() => {
            throw error
        })
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation()

        const result = await fetchFlag(testFlag, defaultValue)

        expect(result.flag).toBe(defaultValue)
        expect(result.error).toBe(error)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error fetching feature flag'),
            error,
        )

        consoleErrorSpy.mockRestore()
    })

    it('should use false as default value when not provided', async () => {
        ldClientMock.variation.mockReturnValue(false)

        const result = await fetchFlag(testFlag)

        expect(ldClientMock.variation).toHaveBeenCalledWith(testFlag, false)
        expect(result.flag).toBe(false)
        expect(result.error).toBeNull()
    })
})
