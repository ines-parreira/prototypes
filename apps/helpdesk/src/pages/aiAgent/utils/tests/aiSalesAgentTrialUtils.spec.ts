import type { StoreConfiguration } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import {
    getAiSalesAgentTrialState,
    getStoresEligibleForTrial,
    isAccountPartOfCanduTrial,
    isAtLeastOneStoreEligibleForTrial,
    isStoreEligibleForTrial,
    TrialState,
} from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'

jest.mock('models/aiAgent/resources/configuration')

describe('aiSalesAgentTrialUtils', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    describe('isAccountPartOfCanduTrial', () => {
        it('should return false if window.Candu is not defined', async () => {
            const originalCandu = window.Candu
            delete window.Candu

            const result = await isAccountPartOfCanduTrial()

            expect(result).toBe(false)
            window.Candu = originalCandu
        })

        it('should return true if the account is part of the Candu trial', async () => {
            const mockGetMembership = jest
                .fn()
                .mockResolvedValue(['FADCAHMBM2'])
            window.Candu = { getMembership: mockGetMembership } as any

            const result = await isAccountPartOfCanduTrial()

            expect(result).toBe(true)
            expect(mockGetMembership).toHaveBeenCalled()
        })

        it('should return false if the account is not part of the Candu trial', async () => {
            const mockGetMembership = jest
                .fn()
                .mockResolvedValue(['OtherSegment'])
            window.Candu = { getMembership: mockGetMembership } as any

            const result = await isAccountPartOfCanduTrial()

            expect(result).toBe(false)
            expect(mockGetMembership).toHaveBeenCalled()
        })
    })

    describe('getAiSalesAgentTrialState', () => {
        it('should return TrialState.Trial if salesDeactivatedDatetime is in the future', () => {
            const currentDate = new Date('2023-01-01T00:00:00Z')
            jest.setSystemTime(currentDate)

            const storeConfiguration = getStoreConfigurationFixture({
                salesDeactivatedDatetime: new Date(
                    currentDate.getTime() + 10000,
                ).toISOString(),
            })
            const result = getAiSalesAgentTrialState(storeConfiguration)

            expect(result).toBe(TrialState.Trial)
        })

        it('should return TrialState.TrialEnded if salesDeactivatedDatetime is in the past', () => {
            const currentDate = new Date('2023-01-01T00:00:00Z')
            jest.setSystemTime(currentDate)

            const storeConfiguration = getStoreConfigurationFixture({
                salesDeactivatedDatetime: new Date(
                    currentDate.getTime() - 10000,
                ).toISOString(),
            })
            const result = getAiSalesAgentTrialState(storeConfiguration)

            expect(result).toBe(TrialState.TrialEnded)
        })

        it('should return TrialState.Trial if the trial is extended for 3 days', () => {
            const currentDate = new Date('2023-01-01T00:00:00Z')
            jest.setSystemTime(currentDate)
            const storeConfiguration = getStoreConfigurationFixture({
                salesDeactivatedDatetime: new Date(
                    currentDate.getTime() - 10000,
                ).toISOString(),
            })
            const result = getAiSalesAgentTrialState(storeConfiguration, 3)

            expect(result).toBe(TrialState.Trial)
        })

        it('should return undefined if salesDeactivatedDatetime is not defined', () => {
            const result = getAiSalesAgentTrialState({} as StoreConfiguration)

            expect(result).toBe(TrialState.NotTrial)
        })
    })

    describe('trial eligibility helpers', () => {
        const currentDate = new Date('2023-01-01T00:00:00Z')

        beforeEach(() => {
            jest.setSystemTime(currentDate)
        })

        it('should return false for stores still covered by the trial extension period', () => {
            const storeActivation = {
                configuration: getStoreConfigurationFixture({
                    salesDeactivatedDatetime: new Date(
                        currentDate.getTime() - 10000,
                    ).toISOString(),
                }),
                support: {
                    chat: {
                        isIntegrationMissing: false,
                    },
                },
            } as any

            expect(isStoreEligibleForTrial(storeActivation, 3)).toBe(false)
        })

        it('should only keep stores that are still eligible for trial', () => {
            const storeActivations = {
                eligibleStore: {
                    configuration: getStoreConfigurationFixture({
                        salesDeactivatedDatetime: null,
                    }),
                    support: {
                        chat: {
                            isIntegrationMissing: false,
                        },
                    },
                },
                extendedTrialStore: {
                    configuration: getStoreConfigurationFixture({
                        salesDeactivatedDatetime: new Date(
                            currentDate.getTime() - 10000,
                        ).toISOString(),
                    }),
                    support: {
                        chat: {
                            isIntegrationMissing: false,
                        },
                    },
                },
                missingIntegrationStore: {
                    configuration: getStoreConfigurationFixture({
                        salesDeactivatedDatetime: null,
                    }),
                    support: {
                        chat: {
                            isIntegrationMissing: true,
                        },
                    },
                },
            } as any

            expect(getStoresEligibleForTrial(storeActivations, 3)).toEqual([
                storeActivations.eligibleStore,
            ])
        })

        it('should return true only when the account is in Candu and has an eligible store', async () => {
            const mockGetMembership = jest
                .fn()
                .mockResolvedValue(['FADCAHMBM2'])
            window.Candu = { getMembership: mockGetMembership } as any

            const storeActivations = {
                eligibleStore: {
                    configuration: getStoreConfigurationFixture({
                        salesDeactivatedDatetime: null,
                    }),
                    support: {
                        chat: {
                            isIntegrationMissing: false,
                        },
                    },
                },
            } as any

            await expect(
                isAtLeastOneStoreEligibleForTrial(storeActivations, 3),
            ).resolves.toBe(true)
        })

        it('should return false when no eligible stores remain after applying the extension period', async () => {
            const mockGetMembership = jest
                .fn()
                .mockResolvedValue(['FADCAHMBM2'])
            window.Candu = { getMembership: mockGetMembership } as any

            const storeActivations = {
                extendedTrialStore: {
                    configuration: getStoreConfigurationFixture({
                        salesDeactivatedDatetime: new Date(
                            currentDate.getTime() - 10000,
                        ).toISOString(),
                    }),
                    support: {
                        chat: {
                            isIntegrationMissing: false,
                        },
                    },
                },
            } as any

            await expect(
                isAtLeastOneStoreEligibleForTrial(storeActivations, 3),
            ).resolves.toBe(false)
        })
    })
})
