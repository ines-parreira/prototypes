import { waitFor } from '@testing-library/react'

import { storeConfigurationKeys } from 'models/aiAgent/queries'
import { upsertStoreConfiguration } from 'models/aiAgent/resources/configuration'
import { AiAgentScope, OnboardingData } from 'models/aiAgent/types'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useGetOnboardingDataByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'
import { useFetchAiAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData'
import { useUpdateAIAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/useUpdateAiAgentStoreConfigurationData'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

jest.mock('models/aiAgent/resources/configuration')
const mockUpsertStoreConfiguration = jest.mocked(upsertStoreConfiguration)
jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName')
jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData',
)

const mockUseGetOnboardingDataByShopName = assumeMock(
    useGetOnboardingDataByShopName,
)
const mockUseFetchAiAgentStoreConfigurationData = assumeMock(
    useFetchAiAgentStoreConfigurationData,
)

const accountDomain = 'test-account'
const storeName = 'test-store'

const mockOnboardingData: OnboardingData = {
    id: '1',
    currentStepName: 'skillset',
    emailIntegrationIds: [1],
    chatIntegrationIds: [],
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
    salesDiscountMax: 0.8,
}

const mockStoreConfiguration = {
    emailChannelDeactivatedDatetime: '2024-03-10T00:00:00.000Z',
    chatChannelDeactivatedDatetime: '2024-03-10T00:00:00.000Z',
    scopes: [AiAgentScope.Support],
}

describe('useUpdateAIAgentStoreConfigurationData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should update the store configuration successfully', async () => {
        mockUseGetOnboardingDataByShopName.mockReturnValue({
            data: mockOnboardingData,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetOnboardingDataByShopName>)

        mockUseFetchAiAgentStoreConfigurationData.mockReturnValue({
            data: mockStoreConfiguration,
            isLoading: false,
        } as unknown as ReturnType<
            typeof useFetchAiAgentStoreConfigurationData
        >)

        const { result, queryClient } =
            renderHookWithStoreAndQueryClientProvider(() =>
                useUpdateAIAgentStoreConfigurationData(
                    accountDomain,
                    storeName,
                ),
            )

        result.current.updateStoreConfig()

        jest.spyOn(queryClient, 'invalidateQueries')

        await waitFor(() => {
            expect(mockUpsertStoreConfiguration).toHaveBeenCalledTimes(1)
            expect(mockUpsertStoreConfiguration).toHaveBeenCalledWith(
                accountDomain,
                {
                    ...mockStoreConfiguration,
                    emailChannelDeactivatedDatetime: null, // Since email integration exists
                    chatChannelDeactivatedDatetime: '2024-03-10T00:00:00.000Z', // Since no chat integration exists
                    scopes: [AiAgentScope.Support], // No chat integration, so no Sales scope
                },
            )
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })
    })

    it('should not update if data is still loading', () => {
        mockUseGetOnboardingDataByShopName.mockReturnValue({
            data: null,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetOnboardingDataByShopName>)

        mockUseFetchAiAgentStoreConfigurationData.mockReturnValue({
            data: null,
            isLoading: true,
        } as unknown as ReturnType<
            typeof useFetchAiAgentStoreConfigurationData
        >)

        const consoleWarnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(() => {})

        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useUpdateAIAgentStoreConfigurationData(accountDomain, storeName),
        )

        result.current.updateStoreConfig()

        expect(mockUpsertStoreConfiguration).not.toHaveBeenCalled()
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            '🚀 ~ updateStoreConfig: Data is still loading, aborting update',
        )

        consoleWarnSpy.mockRestore()
    })
})
