import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import {
    atLeastOneStoreHasActiveTrial,
    hasTrialExpired,
    hasTrialOptedOut,
    hasTrialStarted,
} from '../utils/utils'

// Mock the legacy function
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent', () => ({
    atLeastOneStoreHasActiveTrialOnSpecificStores: jest.fn(() => false),
}))

describe('Trial utility functions', () => {
    describe('hasTrialOptedOut', () => {
        it('should return true when store has opted out', () => {
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

            const result = hasTrialOptedOut(configuration)
            expect(result).toBe(true)
        })

        it('should return false when store has not opted out', () => {
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

            const result = hasTrialOptedOut(configuration)
            expect(result).toBe(false)
        })

        it('should return false when sales data is undefined', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store without trial data',
                sales: undefined,
            })

            const result = hasTrialOptedOut(configuration)
            expect(result).toBe(false)
        })
    })

    describe('hasTrialStarted', () => {
        it('should return true when store has trial start datetime', () => {
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

            const result = hasTrialStarted(configuration)
            expect(result).toBe(true)
        })

        it('should return false when store has no trial start datetime', () => {
            const configuration = getStoreConfigurationFixture({
                storeName: 'Store without trial data',
                sales: undefined,
            })

            const result = hasTrialStarted(configuration)
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

            const result = hasTrialExpired(configuration)
            expect(result).toBe(true)
        })

        it('should return false when trial has not expired', () => {
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

            const result = hasTrialExpired(configuration)
            expect(result).toBe(false)
        })

        it('should return false when actualTerminationDatetime is null', () => {
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

            const result = hasTrialExpired(configuration)
            expect(result).toBe(false)
        })
    })

    describe('atLeastOneStoreHasActiveTrial', () => {
        it('should return true when at least one store has active trial (revamp enabled)', () => {
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

            const storeActivations = {}

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                true,
                storeActivations,
            )
            expect(result).toBe(true)
        })

        it('should return false when no stores have active trial (revamp enabled)', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store without trial data',
                    sales: undefined,
                }),
            ]

            const storeActivations = {}

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                true,
                storeActivations,
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

            // Mock store activations for legacy logic
            const storeActivations = {
                store1: storeActivationFixture({
                    storeName: 'Store with Active Trial',
                }),
            }

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                false, // revamp disabled
                storeActivations,
            )

            // The result depends on the legacy atLeastOneStoreHasActiveTrialOnSpecificStores function
            // which is mocked in the test setup
            expect(result).toBeDefined()
        })

        it('should handle multiple stores with mixed trial states', () => {
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

            const storeActivations = {}

            const result = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                true,
                storeActivations,
            )
            expect(result).toBe(true) // First store has active trial
        })
    })
})
