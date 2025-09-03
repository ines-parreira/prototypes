import { Trial } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

import {
    atLeastOneStoreHasActiveTrial,
    dismissTrialEndedModal,
    dismissTrialEndingModal,
    getTrialEndedDismissedKey,
    getTrialEndingDismissedKey,
    hasTrialExpired,
    hasTrialOptedOut,
    hasTrialStarted,
    isTrialEndedModalDismissed,
    isTrialEndingModalDismissed,
} from '../utils/utils'

const BASE_TRIAL_ACCOUNT = {
    plannedUpgradeDatetime: null,
    optInDatetime: '2023-11-01T00:00:00.000Z',
    optOutDatetime: null,
    actualUpgradeDatetime: null,
    actualTerminationDatetime: null,
}

const createShoppingAssistantTrial = (
    overrides: Partial<Trial> = {},
): Trial => ({
    shopType: 'shopify',
    shopName: 'Test Store',
    type: TrialType.ShoppingAssistant,
    trial: {
        startDatetime: '2023-11-01T00:00:00.000Z',
        endDatetime: '2023-11-15T00:00:00.000Z',
        account: { ...BASE_TRIAL_ACCOUNT },
    },
    ...overrides,
})

const createAiAgentTrial = (overrides: Partial<Trial> = {}): Trial => ({
    shopType: 'shopify',
    shopName: 'Test Store',
    type: TrialType.AiAgent,
    trial: {
        startDatetime: '2023-11-01T00:00:00.000Z',
        endDatetime: '2023-11-15T00:00:00.000Z',
        account: { ...BASE_TRIAL_ACCOUNT },
    },
    ...overrides,
})

describe('Trial utility functions', () => {
    describe('hasTrialOptedOut', () => {
        it('should return true when store has opted out', () => {
            const trial = createShoppingAssistantTrial({
                shopName: 'Store with OptOut',
                trial: {
                    startDatetime: null,
                    endDatetime: null,
                    account: {
                        ...BASE_TRIAL_ACCOUNT,
                        optInDatetime: null,
                        optOutDatetime: '2023-11-01T00:00:00.000Z',
                    },
                },
            })

            const result = hasTrialOptedOut(trial)
            expect(result).toBe(true)
        })

        it('should return false when store has not opted out', () => {
            const trial = createShoppingAssistantTrial({
                shopName: 'Store with OptIn only',
                trial: {
                    startDatetime: null,
                    endDatetime: null,
                    account: BASE_TRIAL_ACCOUNT,
                },
            })

            const result = hasTrialOptedOut(trial)
            expect(result).toBe(false)
        })

        it('should return false when trial data is undefined', () => {
            const trial = createShoppingAssistantTrial({
                shopName: 'Store without trial data',
                trial: undefined as any,
            })

            const result = hasTrialOptedOut(trial)
            expect(result).toBe(false)
        })
    })

    describe('hasTrialStarted', () => {
        it('should return true when store has trial start datetime', () => {
            const trial = createShoppingAssistantTrial({
                shopName: 'Store with Active Trial',
            })

            const result = hasTrialStarted(trial)
            expect(result).toBe(true)
        })

        it('should return false when store has no trial start datetime', () => {
            const trial = createShoppingAssistantTrial({
                shopName: 'Store without trial data',
                trial: undefined as any,
            })

            const result = hasTrialStarted(trial)
            expect(result).toBe(false)
        })
    })

    describe('hasTrialExpired', () => {
        beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2023-11-10T00:00:00.000Z'))
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should return true when trial has expired', () => {
            const trial = createShoppingAssistantTrial({
                shopName: 'Store with Expired Trial',
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-11-15T00:00:00.000Z',
                    account: {
                        ...BASE_TRIAL_ACCOUNT,
                        actualTerminationDatetime: '2023-11-05T00:00:00.000Z',
                    },
                },
            })

            const result = hasTrialExpired(trial)
            expect(result).toBe(true)
        })

        it('should return false when trial has not expired', () => {
            const trial = createShoppingAssistantTrial({
                shopName: 'Store with Active Trial',
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-11-15T00:00:00.000Z',
                    account: {
                        ...BASE_TRIAL_ACCOUNT,
                        actualTerminationDatetime: '2023-11-20T00:00:00.000Z',
                    },
                },
            })

            const result = hasTrialExpired(trial)
            expect(result).toBe(false)
        })

        it('should return false when actualTerminationDatetime is null', () => {
            const trial = createShoppingAssistantTrial({
                shopName: 'Store with Active Trial',
            })

            const result = hasTrialExpired(trial)
            expect(result).toBe(false)
        })
    })

    describe('atLeastOneStoreHasActiveTrial', () => {
        it('should return true when at least one store has active trial', () => {
            const trials = [
                createShoppingAssistantTrial({
                    shopName: 'Store with Active Trial',
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(trials)
            expect(result).toBe(true)
        })

        it('should return false when no stores have active trial', () => {
            const trials = [
                createShoppingAssistantTrial({
                    shopName: 'Store without trial data',
                    trial: undefined as any,
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(trials)
            expect(result).toBe(false)
        })

        it('should handle multiple stores with mixed trial states', () => {
            const trials = [
                createShoppingAssistantTrial({
                    shopName: 'Store with Active Trial',
                }),
                createAiAgentTrial({
                    shopName: 'Store without trial',
                    trial: undefined as any,
                }),
                createShoppingAssistantTrial({
                    shopName: 'Store with opted out trial',
                    trial: {
                        startDatetime: null,
                        endDatetime: null,
                        account: {
                            ...BASE_TRIAL_ACCOUNT,
                            optInDatetime: null,
                            optOutDatetime: '2023-11-02T00:00:00.000Z',
                        },
                    },
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(trials)
            expect(result).toBe(true)
        })
    })

    describe('localStorage utility functions', () => {
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        }

        beforeEach(() => {
            Object.defineProperty(window, 'localStorage', {
                value: localStorageMock,
                writable: true,
            })
            jest.clearAllMocks()
        })

        describe('getTrialEndingDismissedKey', () => {
            it('should generate correct key with storeName and trialType', () => {
                const key = getTrialEndingDismissedKey(
                    'test-store',
                    TrialType.ShoppingAssistant,
                )
                expect(key).toBe(
                    'ai-agent-trial-ending-tomorrow-dismissed:test-store:shoppingAssistant',
                )
            })

            it('should generate correct key for AiAgent trial type', () => {
                const key = getTrialEndingDismissedKey(
                    'another-store',
                    TrialType.AiAgent,
                )
                expect(key).toBe(
                    'ai-agent-trial-ending-tomorrow-dismissed:another-store:aiAgent',
                )
            })
        })

        describe('getTrialEndedDismissedKey', () => {
            it('should generate correct key with storeName and trialType', () => {
                const key = getTrialEndedDismissedKey(
                    'test-store',
                    TrialType.ShoppingAssistant,
                )
                expect(key).toBe(
                    'ai-agent-trial-ended-dismissed:test-store:shoppingAssistant',
                )
            })

            it('should generate correct key for AiAgent trial type', () => {
                const key = getTrialEndedDismissedKey(
                    'another-store',
                    TrialType.AiAgent,
                )
                expect(key).toBe(
                    'ai-agent-trial-ended-dismissed:another-store:aiAgent',
                )
            })
        })

        describe('isTrialEndingModalDismissed', () => {
            it('should return true when localStorage has value "true"', () => {
                localStorageMock.getItem.mockReturnValue('true')
                const result = isTrialEndingModalDismissed(
                    'test-store',
                    TrialType.ShoppingAssistant,
                )
                expect(result).toBe(true)
                expect(localStorageMock.getItem).toHaveBeenCalledWith(
                    'ai-agent-trial-ending-tomorrow-dismissed:test-store:shoppingAssistant',
                )
            })

            it('should return false when localStorage has no value', () => {
                localStorageMock.getItem.mockReturnValue(null)
                const result = isTrialEndingModalDismissed(
                    'test-store',
                    TrialType.ShoppingAssistant,
                )
                expect(result).toBe(false)
            })
        })

        describe('isTrialEndedModalDismissed', () => {
            it('should return true when localStorage has value "true"', () => {
                localStorageMock.getItem.mockReturnValue('true')
                const result = isTrialEndedModalDismissed(
                    'test-store',
                    TrialType.AiAgent,
                )
                expect(result).toBe(true)
                expect(localStorageMock.getItem).toHaveBeenCalledWith(
                    'ai-agent-trial-ended-dismissed:test-store:aiAgent',
                )
            })

            it('should return false when localStorage has no value', () => {
                localStorageMock.getItem.mockReturnValue(null)
                const result = isTrialEndedModalDismissed(
                    'test-store',
                    TrialType.AiAgent,
                )
                expect(result).toBe(false)
            })
        })

        describe('dismissTrialEndingModal', () => {
            it('should set localStorage value to "true"', () => {
                dismissTrialEndingModal(
                    'test-store',
                    TrialType.ShoppingAssistant,
                )
                expect(localStorageMock.setItem).toHaveBeenCalledWith(
                    'ai-agent-trial-ending-tomorrow-dismissed:test-store:shoppingAssistant',
                    'true',
                )
            })
        })

        describe('dismissTrialEndedModal', () => {
            it('should set localStorage value to "true"', () => {
                dismissTrialEndedModal('test-store', TrialType.AiAgent)
                expect(localStorageMock.setItem).toHaveBeenCalledWith(
                    'ai-agent-trial-ended-dismissed:test-store:aiAgent',
                    'true',
                )
            })
        })
    })
})
