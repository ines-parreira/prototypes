import { fetchFlag } from '@repo/feature-flags'

import { checkIfAiAgentOnboardingNotificationIsEnabled } from '../utils'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    fetchFlag: jest.fn(async (_flag: string, defaultValue = false) => ({
        flag: defaultValue,
        error: null,
    })),
}))

const fetchFlagMock = jest.mocked(fetchFlag)

describe('utils', () => {
    beforeEach(() => {
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })
    })

    describe('checkIfAiAgentOnboardingNotificationIsEnabled', () => {
        it('should return true if the feature flag is enabled', async () => {
            const result = await checkIfAiAgentOnboardingNotificationIsEnabled()

            expect(result).toBe(true)
        })

        it('should return false if the feature flag is disabled', async () => {
            fetchFlagMock.mockResolvedValue({ flag: false, error: null })

            const result = await checkIfAiAgentOnboardingNotificationIsEnabled()

            expect(result).toBe(false)
        })
    })
})
