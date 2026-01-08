import type { LDClient } from 'launchdarkly-js-client-sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FeatureFlagKey } from '../featureFlagKey'
import { fetchFlag } from '../fetchFlag'
import { getLDClient } from '../launchdarkly'

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

describe('fetchFlag', () => {
    const testFlag = FeatureFlagKey.ReportingP1MetricMigration
    let ldClientMock: ReturnType<typeof createLDClientMock>
    let initialisePromise: Promise<unknown>

    beforeEach(() => {
        vi.clearAllMocks()
        ldClientMock = createLDClientMock()
        initialisePromise = Promise.resolve()
        ldClientMock.variation.mockReturnValue(false)
        ldClientMock.waitForInitialization.mockReturnValue(
            initialisePromise as Promise<void>,
        )
        getLDClientMock.mockReturnValue(ldClientMock as unknown as LDClient)
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
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})

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
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})

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
