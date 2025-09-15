import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { ldClientMock } from 'jest-launchdarkly-mock'

import { fetchShouldIncludeBots } from 'domains/reporting/hooks/useShouldIncludeBots'
import { getLDClient } from 'utils/launchDarkly'

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
}))
const getLDClientMock = assumeMock(getLDClient)

describe('shouldIncludeBots', () => {
    describe('fetchShouldIncludeBots', () => {
        beforeEach(() => {
            ldClientMock.waitForInitialization.mockResolvedValue(undefined)
            getLDClientMock.mockReturnValue(ldClientMock)
        })

        afterEach(() => {
            jest.clearAllMocks()
        })

        it('should return true when ReportingHrtWithoutBots flag is false (include bots)', async () => {
            ldClientMock.variation.mockReturnValue(false)

            const result = await fetchShouldIncludeBots()

            expect(ldClientMock.variation).toHaveBeenCalledWith(
                FeatureFlagKey.ReportingHrtWithoutBots,
                false,
            )
            expect(result).toBe(true)
        })

        it('should return false when ReportingHrtWithoutBots flag is true (exclude bots)', async () => {
            ldClientMock.variation.mockReturnValue(true)

            const result = await fetchShouldIncludeBots()

            expect(ldClientMock.variation).toHaveBeenCalledWith(
                FeatureFlagKey.ReportingHrtWithoutBots,
                false,
            )
            expect(result).toBe(false)
        })
    })
})
