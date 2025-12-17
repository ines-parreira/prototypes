import { checkIfAiAgentOnboardingNotificationIsEnabled } from '../utils'

const variationMock = jest.fn()
const waitForInitializationMock = jest.fn(() => Promise.resolve())

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: variationMock,
        waitForInitialization: waitForInitializationMock,
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))

describe('utils', () => {
    beforeEach(() => {
        variationMock.mockReturnValue(true)
    })

    describe('checkIfAiAgentOnboardingNotificationIsEnabled', () => {
        it('should return true if the feature flag is enabled', async () => {
            const result = await checkIfAiAgentOnboardingNotificationIsEnabled()

            expect(result).toBe(true)
        })

        it('should return false if the feature flag is disabled', async () => {
            variationMock.mockReturnValue(false)

            const result = await checkIfAiAgentOnboardingNotificationIsEnabled()

            expect(result).toBe(false)
        })
    })
})
