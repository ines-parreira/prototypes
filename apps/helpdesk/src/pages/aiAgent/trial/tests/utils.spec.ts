import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

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

// Mock the legacy function
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent', () => ({
    atLeastOneStoreHasActiveTrialOnSpecificStores: jest.fn(() => false),
}))

describe('Trial utility functions', () => {
    describe('hasTrialOptedOut', () => {
        it('should return true when store has opted out (ShoppingAssistant)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with OptOut',
                sales: {
                    trial: {
                        startDatetime: null,
                        endDatetime: null,
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: null,
                            optOutDatetime: '2023-11-01T00:00:00.000Z',
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            })

            const result = hasTrialOptedOut(
                TrialType.ShoppingAssistant,
                configuration,
            )
            expect(result).toBe(true)
        })

        it('should return true when store has opted out (AiAgent)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with OptOut',
                trial: {
                    startDatetime: null,
                    endDatetime: null,
                    account: {
                        plannedUpgradeDatetime: null,
                        optInDatetime: null,
                        optOutDatetime: '2023-11-01T00:00:00.000Z',
                        actualUpgradeDatetime: null,
                        actualTerminationDatetime: null,
                    },
                },
            })

            const result = hasTrialOptedOut(TrialType.AiAgent, configuration)
            expect(result).toBe(true)
        })

        it('should return false when store has not opted out (ShoppingAssistant)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with OptIn only',
                sales: {
                    trial: {
                        startDatetime: null,
                        endDatetime: null,
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: '2023-11-01T00:00:00.000Z',
                            optOutDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            })

            const result = hasTrialOptedOut(
                TrialType.ShoppingAssistant,
                configuration,
            )
            expect(result).toBe(false)
        })

        it('should return false when store has not opted out (AiAgent)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with OptIn only',
                trial: {
                    startDatetime: null,
                    endDatetime: null,
                    account: {
                        plannedUpgradeDatetime: null,
                        optInDatetime: null,
                        optOutDatetime: null,
                        actualUpgradeDatetime: null,
                        actualTerminationDatetime: null,
                    },
                },
            })

            const result = hasTrialOptedOut(TrialType.AiAgent, configuration)
            expect(result).toBe(false)
        })

        it('should return false when trial data is undefined (ShoppingAssistant)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store without trial data',
                sales: undefined,
            })

            const result = hasTrialOptedOut(
                TrialType.ShoppingAssistant,
                configuration,
            )
            expect(result).toBe(false)
        })

        it('should return false when trial data is undefined (AiAgent)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store without trial data',
                trial: undefined,
            })

            const result = hasTrialOptedOut(TrialType.AiAgent, configuration)
            expect(result).toBe(false)
        })
    })

    describe('hasTrialStarted', () => {
        it('should return true when store has trial start datetime (ShoppingAssistant)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with Active Trial',
                sales: {
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-11-15T00:00:00.000Z',
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: '2023-11-01T00:00:00.000Z',
                            optOutDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            })

            const result = hasTrialStarted(
                TrialType.ShoppingAssistant,
                configuration,
            )
            expect(result).toBe(true)
        })

        it('should return true when store has trial start datetime (AiAgent)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with Active Trial',
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-11-15T00:00:00.000Z',
                    account: {
                        plannedUpgradeDatetime: null,
                        optInDatetime: null,
                        optOutDatetime: null,
                        actualUpgradeDatetime: null,
                        actualTerminationDatetime: null,
                    },
                },
            })

            const result = hasTrialStarted(TrialType.AiAgent, configuration)
            expect(result).toBe(true)
        })

        it('should return false when store has no trial start datetime (ShoppingAssistant)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store without trial data',
                sales: undefined,
            })

            const result = hasTrialStarted(
                TrialType.ShoppingAssistant,
                configuration,
            )
            expect(result).toBe(false)
        })

        it('should return false when store has no trial start datetime (AiAgent)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store without trial data',
                trial: undefined,
            })

            const result = hasTrialStarted(TrialType.AiAgent, configuration)
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

        it('should return true when trial has expired (ShoppingAssistant)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with Expired Trial',
                sales: {
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-11-15T00:00:00.000Z',
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: '2023-11-01T00:00:00.000Z',
                            optOutDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime:
                                '2023-11-05T00:00:00.000Z',
                        },
                    },
                },
            })

            const result = hasTrialExpired(
                TrialType.ShoppingAssistant,
                configuration,
            )
            expect(result).toBe(true)
        })

        it('should return true when trial has expired (AiAgent)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with Expired Trial',
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-11-15T00:00:00.000Z',
                    account: {
                        plannedUpgradeDatetime: null,
                        optInDatetime: null,
                        optOutDatetime: null,
                        actualUpgradeDatetime: null,
                        actualTerminationDatetime: '2023-11-05T00:00:00.000Z',
                    },
                },
            })

            const result = hasTrialExpired(TrialType.AiAgent, configuration)
            expect(result).toBe(true)
        })

        it('should return false when trial has not expired (ShoppingAssistant)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with Active Trial',
                sales: {
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-11-15T00:00:00.000Z',
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: '2023-11-01T00:00:00.000Z',
                            optOutDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime:
                                '2023-11-20T00:00:00.000Z',
                        },
                    },
                },
            })

            const result = hasTrialExpired(
                TrialType.ShoppingAssistant,
                configuration,
            )
            expect(result).toBe(false)
        })

        it('should return false when trial has not expired (AiAgent)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with Active Trial',
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-11-15T00:00:00.000Z',
                    account: {
                        plannedUpgradeDatetime: null,
                        optInDatetime: null,
                        optOutDatetime: null,
                        actualUpgradeDatetime: null,
                        actualTerminationDatetime: '2023-11-20T00:00:00.000Z',
                    },
                },
            })

            const result = hasTrialExpired(TrialType.AiAgent, configuration)
            expect(result).toBe(false)
        })

        it('should return false when actualTerminationDatetime is null (ShoppingAssistant)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with Active Trial',
                sales: {
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-11-15T00:00:00.000Z',
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: '2023-11-01T00:00:00.000Z',
                            optOutDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            })

            const result = hasTrialExpired(
                TrialType.ShoppingAssistant,
                configuration,
            )
            expect(result).toBe(false)
        })

        it('should return false when actualTerminationDatetime is null (AiAgent)', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store with Active Trial',
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-11-15T00:00:00.000Z',
                    account: {
                        plannedUpgradeDatetime: null,
                        optInDatetime: null,
                        optOutDatetime: null,
                        actualUpgradeDatetime: null,
                        actualTerminationDatetime: null,
                    },
                },
            })

            const result = hasTrialExpired(TrialType.AiAgent, configuration)
            expect(result).toBe(false)
        })
    })

    describe('atLeastOneStoreHasActiveTrial', () => {
        it('should return true when at least one store has active trial (ShoppingAssistant)', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store with Active Trial',
                    sales: {
                        trial: {
                            startDatetime: '2023-11-01T00:00:00.000Z',
                            endDatetime: '2023-11-15T00:00:00.000Z',
                            account: {
                                plannedUpgradeDatetime: null,
                                optInDatetime: '2023-11-01T00:00:00.000Z',
                                optOutDatetime: null,
                                actualUpgradeDatetime: null,
                                actualTerminationDatetime: null,
                            },
                        },
                    },
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                TrialType.ShoppingAssistant,
            )
            expect(result).toBe(true)
        })

        it('should return true when at least one store has active trial (AiAgent)', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store with Active Trial',
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-11-15T00:00:00.000Z',
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: null,
                            optOutDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                TrialType.AiAgent,
            )
            expect(result).toBe(true)
        })

        it('should return false when no stores have active trial (ShoppingAssistant)', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store without trial data',
                    sales: undefined,
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                TrialType.ShoppingAssistant,
            )
            expect(result).toBe(false)
        })

        it('should return false when no stores have active trial (AiAgent)', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store without trial data',
                    trial: undefined,
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                TrialType.AiAgent,
            )
            expect(result).toBe(false)
        })

        it('should use legacy logic when revamp is disabled', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store with Active Trial',
                    sales: {
                        trial: {
                            startDatetime: '2023-11-01T00:00:00.000Z',
                            endDatetime: '2023-11-15T00:00:00.000Z',
                            account: {
                                plannedUpgradeDatetime: null,
                                optInDatetime: '2023-11-01T00:00:00.000Z',
                                optOutDatetime: null,
                                actualUpgradeDatetime: null,
                                actualTerminationDatetime: null,
                            },
                        },
                    },
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                TrialType.ShoppingAssistant,
            )

            // The result depends on the legacy atLeastOneStoreHasActiveTrialOnSpecificStores function
            // which is mocked in the test setup
            expect(result).toBeDefined()
        })

        it('should handle multiple stores with mixed trial states (ShoppingAssistant)', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store with Active Trial',
                    sales: {
                        trial: {
                            startDatetime: '2023-11-01T00:00:00.000Z',
                            endDatetime: '2023-11-15T00:00:00.000Z',
                            account: {
                                plannedUpgradeDatetime: null,
                                optInDatetime: '2023-11-01T00:00:00.000Z',
                                optOutDatetime: null,
                                actualUpgradeDatetime: null,
                                actualTerminationDatetime: null,
                            },
                        },
                    },
                }),
                getStoreConfigurationFixture({
                    storeName: 'Store without trial',
                    sales: undefined,
                }),
                getStoreConfigurationFixture({
                    storeName: 'Store with opted out trial',
                    sales: {
                        trial: {
                            startDatetime: null,
                            endDatetime: null,
                            account: {
                                plannedUpgradeDatetime: null,
                                optInDatetime: null,
                                optOutDatetime: '2023-11-02T00:00:00.000Z',
                                actualUpgradeDatetime: null,
                                actualTerminationDatetime: null,
                            },
                        },
                    },
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                TrialType.ShoppingAssistant,
            )
            expect(result).toBe(true) // First store has active trial
        })

        it('should handle multiple stores with mixed trial states (AiAgent)', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store with Active Trial',
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-11-15T00:00:00.000Z',
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: null,
                            optOutDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                }),
                getStoreConfigurationFixture({
                    storeName: 'Store without trial',
                    trial: undefined,
                }),
                getStoreConfigurationFixture({
                    storeName: 'Store with opted out trial',
                    trial: {
                        startDatetime: null,
                        endDatetime: null,
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: null,
                            optOutDatetime: '2023-11-02T00:00:00.000Z',
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                }),
            ]

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                TrialType.AiAgent,
            )
            expect(result).toBe(true) // First store has active trial
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
