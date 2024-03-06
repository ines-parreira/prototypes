import {getLDClient} from 'utils/launchDarkly'
import {checkIfTrackerIsEnabled} from 'services/activityTracker/utils'

jest.mock('utils/launchDarkly')
const variationMock = getLDClient().variation as jest.Mock
;(getLDClient().waitForInitialization as jest.Mock).mockResolvedValue({})

describe('utils', () => {
    beforeEach(() => {
        variationMock.mockImplementation(() => true)
        window.USER_IMPERSONATED = null
    })

    describe('checkIfTrackerIsEnabled', () => {
        it('should return true if the feature flag is enabled and the user is not impersonated', async () => {
            const result = await checkIfTrackerIsEnabled()

            expect(result).toBe(true)
        })

        it('should return false if the feature flag is disabled', async () => {
            variationMock.mockImplementation(() => false)

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
