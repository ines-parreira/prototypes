import { checkIfTrackerIsEnabled } from '../utils'

const variationMock = vi.fn()
const waitForInitializationMock = vi.fn(() => Promise.resolve())

vi.mock('@repo/feature-flags', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@repo/feature-flags')>()),
    useFlag: vi.fn((flag, defaultValue) => defaultValue),
    getLDClient: vi.fn(() => ({
        variation: variationMock,
        waitForInitialization: waitForInitializationMock,
        on: vi.fn(),
        off: vi.fn(),
        allFlags: vi.fn(() => ({})),
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
