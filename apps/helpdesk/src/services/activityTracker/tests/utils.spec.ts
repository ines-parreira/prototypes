import { checkIfTrackerIsEnabled } from 'services/activityTracker/utils'

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
        window.USER_IMPERSONATED = null
    })

    describe('checkIfTrackerIsEnabled', () => {
        it('should return true if the feature flag is enabled and the user is not impersonated', async () => {
            const result = await checkIfTrackerIsEnabled()

            expect(result).toBe(true)
        })

        it('should return false if the feature flag is disabled', async () => {
            variationMock.mockReturnValue(false)

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
