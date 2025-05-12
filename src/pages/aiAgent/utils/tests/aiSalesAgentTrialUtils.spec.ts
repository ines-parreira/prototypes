import { StoreConfiguration } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import {
    getAiSalesAgentTrialState,
    isAccountPartOfCanduTrial,
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
                .mockResolvedValue(['GqzPfgRSY3'])
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

        it('should return undefined if salesDeactivatedDatetime is not defined', () => {
            const result = getAiSalesAgentTrialState({} as StoreConfiguration)

            expect(result).toBe(TrialState.NotTrial)
        })
    })
})
