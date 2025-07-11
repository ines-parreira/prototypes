import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import {
    atLeastOneStoreHasActiveTrial,
    atLeastOneStoreHasOptedOut,
} from '../utils/utils'

describe('Trial utility functions', () => {
    describe('atLeastOneStoreHasOptedOut', () => {
        it('should return true when at least one store has opted out', () => {
            const storeActivations = {
                store1: {
                    ...storeActivationFixture({
                        storeName: 'Store with OptOut',
                    }),
                    configuration: getStoreConfigurationFixture({
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
                    }),
                },
                store2: {
                    ...storeActivationFixture({
                        storeName: 'Store without trial data',
                    }),
                    configuration: getStoreConfigurationFixture({
                        storeName: 'Store without trial data',
                        sales: undefined,
                    }),
                },
            }

            const storeConfigurations = Object.values(storeActivations).map(
                (storeActivation) => storeActivation.configuration,
            )
            const result = atLeastOneStoreHasOptedOut(storeConfigurations, true)
            expect(result).toBe(true)
        })

        it('should return false when no stores have opted out', () => {
            const storeActivations = {
                store1: {
                    ...storeActivationFixture({
                        storeName: 'Store without trial data',
                    }),
                    configuration: getStoreConfigurationFixture({
                        storeName: 'Store without trial data',
                        sales: undefined,
                    }),
                },
                store2: {
                    ...storeActivationFixture({
                        storeName: 'Store with OptIn only',
                    }),
                    configuration: getStoreConfigurationFixture({
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
                    }),
                },
            }

            const storeConfigurations = Object.values(storeActivations).map(
                (storeActivation) => storeActivation.configuration,
            )
            const result = atLeastOneStoreHasOptedOut(storeConfigurations, true)
            expect(result).toBe(false)
        })

        it('should return false when revamp trial is disabled', () => {
            const storeActivations = {
                store1: {
                    ...storeActivationFixture({
                        storeName: 'Store with OptOut',
                    }),
                    configuration: getStoreConfigurationFixture({
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
                    }),
                },
            }

            const storeConfigurations = Object.values(storeActivations).map(
                (storeActivation) => storeActivation.configuration,
            )
            const result = atLeastOneStoreHasOptedOut(
                storeConfigurations,
                false,
            )
            expect(result).toBe(false)
        })

        it('should handle empty store configurations', () => {
            const result = atLeastOneStoreHasOptedOut([], true)
            expect(result).toBe(false)
        })
    })

    describe('atLeastOneStoreHasActiveTrial', () => {
        it('should return true when at least one store has active trial', () => {
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

        it('should return false when no stores have active trial', () => {
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

        it('should handle both opt-in and opt-out stores correctly', () => {
            const storeConfigurations = [
                getStoreConfigurationFixture({
                    storeName: 'Store with OptIn',
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
                }),
                getStoreConfigurationFixture({
                    storeName: 'Store with OptOut',
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

            // Should be false because no stores have startDatetime
            const hasActiveTrial = atLeastOneStoreHasActiveTrial(
                storeConfigurations,
                true,
                storeActivations,
            )
            expect(hasActiveTrial).toBe(false)

            // But should return correct opt-out values
            const storeActivationsForOptOut = {
                store1: {
                    ...storeActivationFixture({
                        storeName: 'Store with OptIn',
                    }),
                    configuration: storeConfigurations[0],
                },
                store2: {
                    ...storeActivationFixture({
                        storeName: 'Store with OptOut',
                    }),
                    configuration: storeConfigurations[1],
                },
            }
            const storeConfigurationsForOptOut = Object.values(
                storeActivationsForOptOut,
            ).map((storeActivation) => storeActivation.configuration)
            const hasOptedOut = atLeastOneStoreHasOptedOut(
                storeConfigurationsForOptOut,
                true,
            )

            expect(hasOptedOut).toBe(true)
        })
    })
})
