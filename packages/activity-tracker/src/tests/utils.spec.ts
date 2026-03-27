import { fetchFlag } from '@repo/feature-flags'

import { checkIfTrackerIsEnabled } from '../utils'

vi.mock('@repo/feature-flags', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@repo/feature-flags')>()),
    useFlag: vi.fn((flag, defaultValue) => defaultValue),
    fetchFlag: vi.fn(async (_flag: string, defaultValue = false) => ({
        flag: defaultValue,
        error: null,
    })),
}))

const fetchFlagMock = vi.mocked(fetchFlag)

describe('utils', () => {
    beforeEach(() => {
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })
        window.USER_IMPERSONATED = null
    })

    describe('checkIfTrackerIsEnabled', () => {
        it('should return true if the feature flag is enabled and the user is not impersonated', async () => {
            const result = await checkIfTrackerIsEnabled()

            expect(result).toBe(true)
        })

        it('should return false if the feature flag is disabled', async () => {
            fetchFlagMock.mockResolvedValue({ flag: false, error: null })

            const result = await checkIfTrackerIsEnabled()

            expect(result).toBe(false)
        })

        it('should return false if the user is impersonated', async () => {
            window.USER_IMPERSONATED = true

            const result = await checkIfTrackerIsEnabled()

            expect(result).toBe(false)
        })
    })
})
