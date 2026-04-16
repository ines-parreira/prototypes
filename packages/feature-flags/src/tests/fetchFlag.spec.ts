import { beforeEach, describe, expect, it, vi } from 'vitest'

import { evaluateFlagAsync } from '../dualEvaluation'
import { FeatureFlagKey } from '../featureFlagKey'
import { fetchFlag } from '../fetchFlag'

vi.mock('../dualEvaluation', () => ({
    evaluateFlagAsync: vi.fn(),
}))

const evaluateFlagAsyncMock = vi.mocked(evaluateFlagAsync)

describe('fetchFlag', () => {
    const testFlag = FeatureFlagKey.ReportingP1MetricMigration

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return the flag value from the client when successful', async () => {
        const expectedValue = 'shadow'
        evaluateFlagAsyncMock.mockResolvedValue({
            value: expectedValue,
            error: null,
        })

        const result = await fetchFlag(testFlag, 'off')

        expect(evaluateFlagAsyncMock).toHaveBeenCalledWith(testFlag, 'off')
        expect(result.flag).toBe(expectedValue)
        expect(result.error).toBeNull()
    })

    it('should return the default value when flag is not set', async () => {
        const defaultValue = 'off'
        evaluateFlagAsyncMock.mockResolvedValue({
            value: defaultValue,
            error: null,
        })

        const result = await fetchFlag(testFlag, defaultValue)

        expect(result.flag).toBe(defaultValue)
        expect(result.error).toBeNull()
    })

    it('should return default value and error when initialization fails', async () => {
        const defaultValue = 'off'
        const error = new Error('Initialization failed')
        evaluateFlagAsyncMock.mockResolvedValue({
            value: defaultValue,
            error,
        })

        const result = await fetchFlag(testFlag, defaultValue)

        expect(result.flag).toBe(defaultValue)
        expect(result.error).toBe(error)
    })

    it('should use false as default value when not provided', async () => {
        evaluateFlagAsyncMock.mockResolvedValue({
            value: false,
            error: null,
        })

        const result = await fetchFlag(testFlag)

        expect(evaluateFlagAsyncMock).toHaveBeenCalledWith(testFlag, false)
        expect(result.flag).toBe(false)
        expect(result.error).toBeNull()
    })
})
