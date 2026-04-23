import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as harness from '../engines/harness'
import { initFeatureFlagsClient } from '../initFeatureFlagsClient'

vi.mock('../engines/harness', () => ({
    initialize: vi.fn(),
}))

const initializeMock = vi.mocked(harness.initialize)

describe('initFeatureFlagsClient', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('builds a flag context from user and account', () => {
        initFeatureFlagsClient(
            { id: 'usr-1' },
            { id: 'acc-1', domain: 'test.com' },
        )

        expect(initializeMock).toHaveBeenCalledTimes(1)
        const [flagContext] = initializeMock.mock.calls[0]
        expect(flagContext.key).toBe('acc-1')
        expect(flagContext.attributes).toMatchObject({
            userId: 'usr-1',
            domain: 'test.com',
        })
    })

    it('falls back to the "anonymous" key when user is missing', () => {
        initFeatureFlagsClient(undefined as unknown as { id: string }, {
            id: 'acc-1',
            domain: 'test.com',
        })

        expect(initializeMock).toHaveBeenCalledWith({
            key: 'anonymous',
            attributes: {},
        })
    })

    it('falls back to the "anonymous" key when account is missing', () => {
        initFeatureFlagsClient(
            { id: 'usr-1' },
            undefined as unknown as { id: string; domain: string },
        )

        expect(initializeMock).toHaveBeenCalledWith({
            key: 'anonymous',
            attributes: {},
        })
    })
})
