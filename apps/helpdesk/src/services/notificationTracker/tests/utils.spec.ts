import { getLDClient } from 'utils/launchDarkly'

import { checkIfAiAgentOnboardingNotificationIsEnabled } from '../utils'

jest.mock('utils/launchDarkly')
const variationMock = getLDClient().variation as jest.Mock
;(getLDClient().waitForInitialization as jest.Mock).mockResolvedValue({})

describe('utils', () => {
    beforeEach(() => {
        variationMock.mockImplementation(() => true)
    })

    describe('checkIfAiAgentOnboardingNotificationIsEnabled', () => {
        it('should return true if the feature flag is enabled', async () => {
            const result = await checkIfAiAgentOnboardingNotificationIsEnabled()

            expect(result).toBe(true)
        })

        it('should return false if the feature flag is disabled', async () => {
            variationMock.mockImplementation(() => false)

            const result = await checkIfAiAgentOnboardingNotificationIsEnabled()

            expect(result).toBe(false)
        })
    })
})
