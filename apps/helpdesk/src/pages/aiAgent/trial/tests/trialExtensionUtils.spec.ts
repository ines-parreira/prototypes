import {
    canRequestTrialExtension,
    markTrialExtensionRequested,
} from '../utils/trialExtensionUtils'

const TRIAL_EXTENSION_REQUESTED_KEY =
    'ai-agent-trial-extension-requested-timestamp'

describe('trialExtensionUtils', () => {
    let mockLocalStorage: { [key: string]: string } = {}

    beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))

        mockLocalStorage = {}

        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            return mockLocalStorage[key] || null
        })

        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(
            (key, value) => {
                mockLocalStorage[key] = value
            },
        )
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
        jest.restoreAllMocks()
    })

    describe('when no previous trial extension request exists', () => {
        it('should return true for canRequestTrialExtension', () => {
            expect(canRequestTrialExtension()).toBe(true)
        })
    })

    describe('when a trial extension was requested less than 24 hours ago', () => {
        it('should return false for canRequestTrialExtension', () => {
            // Set timestamp for 1 hour ago
            const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000
            mockLocalStorage[TRIAL_EXTENSION_REQUESTED_KEY] =
                oneHourAgo.toString()

            expect(canRequestTrialExtension()).toBe(false)
        })
    })

    describe('when a trial extension was requested exactly 24 hours ago', () => {
        it('should return true for canRequestTrialExtension', () => {
            // Set timestamp for exactly 24 hours ago
            const exactlyTwentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
            mockLocalStorage[TRIAL_EXTENSION_REQUESTED_KEY] =
                exactlyTwentyFourHoursAgo.toString()

            expect(canRequestTrialExtension()).toBe(true)
        })
    })

    describe('when a trial extension was requested more than 24 hours ago', () => {
        it('should return true for canRequestTrialExtension', () => {
            // Set timestamp for 25 hours ago
            const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000
            mockLocalStorage[TRIAL_EXTENSION_REQUESTED_KEY] =
                twentyFiveHoursAgo.toString()

            expect(canRequestTrialExtension()).toBe(true)
        })
    })

    describe('when markTrialExtensionRequested is called', () => {
        it('should save current timestamp to localStorage', () => {
            markTrialExtensionRequested()

            expect(localStorage.setItem).toHaveBeenCalledWith(
                TRIAL_EXTENSION_REQUESTED_KEY,
                Date.now().toString(),
            )
        })

        it('should update canRequestTrialExtension to false', () => {
            expect(canRequestTrialExtension()).toBe(true)

            markTrialExtensionRequested()

            expect(canRequestTrialExtension()).toBe(false)
        })
    })

    describe('when localStorage contains non-numeric timestamp', () => {
        it('should return true for canRequestTrialExtension', () => {
            mockLocalStorage[TRIAL_EXTENSION_REQUESTED_KEY] = 'not-a-number'

            expect(canRequestTrialExtension()).toBe(true)
        })
    })

    describe('when localStorage contains empty string', () => {
        it('should return true for canRequestTrialExtension', () => {
            mockLocalStorage[TRIAL_EXTENSION_REQUESTED_KEY] = ''

            expect(canRequestTrialExtension()).toBe(true)
        })
    })
})
