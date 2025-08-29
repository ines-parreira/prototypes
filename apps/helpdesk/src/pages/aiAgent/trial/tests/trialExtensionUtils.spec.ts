import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

import {
    AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY,
    canRequestTrialExtension,
    markTrialExtensionRequested,
    SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY,
} from '../utils/trialExtensionUtils'

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

    describe('ShoppingAssistant trial type', () => {
        const trialType = TrialType.ShoppingAssistant

        describe('when no previous trial extension request exists', () => {
            it('should return true for canRequestTrialExtension', () => {
                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })

        describe('when a trial extension was requested less than 24 hours ago', () => {
            it('should return false for canRequestTrialExtension', () => {
                const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000
                mockLocalStorage[
                    SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY
                ] = oneHourAgo.toString()

                expect(canRequestTrialExtension(trialType)).toBe(false)
            })
        })

        describe('when a trial extension was requested exactly 24 hours ago', () => {
            it('should return true for canRequestTrialExtension', () => {
                const exactlyTwentyFourHoursAgo =
                    Date.now() - 24 * 60 * 60 * 1000
                mockLocalStorage[
                    SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY
                ] = exactlyTwentyFourHoursAgo.toString()

                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })

        describe('when a trial extension was requested more than 24 hours ago', () => {
            it('should return true for canRequestTrialExtension', () => {
                const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000
                mockLocalStorage[
                    SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY
                ] = twentyFiveHoursAgo.toString()

                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })

        describe('when markTrialExtensionRequested is called', () => {
            it('should save current timestamp to localStorage', () => {
                markTrialExtensionRequested(trialType)

                expect(localStorage.setItem).toHaveBeenCalledWith(
                    SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY,
                    Date.now().toString(),
                )
            })

            it('should update canRequestTrialExtension to false', () => {
                expect(canRequestTrialExtension(trialType)).toBe(true)

                markTrialExtensionRequested(trialType)

                expect(canRequestTrialExtension(trialType)).toBe(false)
            })
        })

        describe('when localStorage contains non-numeric timestamp', () => {
            it('should return true for canRequestTrialExtension', () => {
                mockLocalStorage[
                    SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY
                ] = 'not-a-number'

                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })

        describe('when localStorage contains empty string', () => {
            it('should return true for canRequestTrialExtension', () => {
                mockLocalStorage[
                    SHOPPING_ASSISTANT_TRIAL_EXTENSION_REQUESTED_KEY
                ] = ''

                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })
    })

    describe('AiAgent trial type', () => {
        const trialType = TrialType.AiAgent

        describe('when no previous trial extension request exists', () => {
            it('should return true for canRequestTrialExtension', () => {
                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })

        describe('when a trial extension was requested less than 24 hours ago', () => {
            it('should return false for canRequestTrialExtension', () => {
                const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000
                mockLocalStorage[AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY] =
                    oneHourAgo.toString()

                expect(canRequestTrialExtension(trialType)).toBe(false)
            })
        })

        describe('when a trial extension was requested exactly 24 hours ago', () => {
            it('should return true for canRequestTrialExtension', () => {
                const exactlyTwentyFourHoursAgo =
                    Date.now() - 24 * 60 * 60 * 1000
                mockLocalStorage[AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY] =
                    exactlyTwentyFourHoursAgo.toString()

                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })

        describe('when a trial extension was requested more than 24 hours ago', () => {
            it('should return true for canRequestTrialExtension', () => {
                const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000
                mockLocalStorage[AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY] =
                    twentyFiveHoursAgo.toString()

                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })

        describe('when markTrialExtensionRequested is called', () => {
            it('should save current timestamp to localStorage', () => {
                markTrialExtensionRequested(trialType)

                expect(localStorage.setItem).toHaveBeenCalledWith(
                    AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY,
                    Date.now().toString(),
                )
            })

            it('should update canRequestTrialExtension to false', () => {
                expect(canRequestTrialExtension(trialType)).toBe(true)

                markTrialExtensionRequested(trialType)

                expect(canRequestTrialExtension(trialType)).toBe(false)
            })
        })

        describe('when localStorage contains non-numeric timestamp', () => {
            it('should return true for canRequestTrialExtension', () => {
                mockLocalStorage[AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY] =
                    'not-a-number'

                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })

        describe('when localStorage contains empty string', () => {
            it('should return true for canRequestTrialExtension', () => {
                mockLocalStorage[AI_AGENT_TRIAL_EXTENSION_REQUESTED_KEY] = ''

                expect(canRequestTrialExtension(trialType)).toBe(true)
            })
        })
    })
})
