import { beforeEach, describe, expect, it, vi } from 'vitest'

import { evaluateAsync } from '../engines/harness'
import { FeatureFlagKey } from '../featureFlagKey'
import { fetchFlag } from '../fetchFlag'

vi.mock('../engines/harness', () => ({
    evaluateAsync: vi.fn(),
}))

const evaluateAsyncMock = vi.mocked(evaluateAsync)

describe('fetchFlag', () => {
    const testFlag = FeatureFlagKey.ReportingP1MetricMigration

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns the flag value when the engine resolves', async () => {
        evaluateAsyncMock.mockResolvedValue('shadow')

        const result = await fetchFlag(testFlag, 'off')

        expect(evaluateAsyncMock).toHaveBeenCalledWith(testFlag, 'off')
        expect(result.flag).toBe('shadow')
        expect(result.error).toBeNull()
    })

    it('returns the default value when the engine returns it', async () => {
        evaluateAsyncMock.mockResolvedValue('off')

        const result = await fetchFlag(testFlag, 'off')

        expect(result.flag).toBe('off')
        expect(result.error).toBeNull()
    })

    it('returns default value and the error when the engine rejects', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const error = new Error('Initialization failed')
        evaluateAsyncMock.mockRejectedValue(error)

        const result = await fetchFlag(testFlag, 'off')

        expect(result.flag).toBe('off')
        expect(result.error).toBe(error)
        consoleSpy.mockRestore()
    })

    it('uses false as default value when not provided', async () => {
        evaluateAsyncMock.mockResolvedValue(false)

        const result = await fetchFlag(testFlag)

        expect(evaluateAsyncMock).toHaveBeenCalledWith(testFlag, false)
        expect(result.flag).toBe(false)
        expect(result.error).toBeNull()
    })
})
