import { waitFor } from '@testing-library/react'

import { useUpsertStoreConfigurationPure } from 'models/aiAgent/queries'
import { AiAgentScope, OnboardingData } from 'models/aiAgent/types'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useGetOnboardingDataByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'
import { useFetchAiAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData'
import { useUpdateAIAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/useUpdateAiAgentStoreConfigurationData'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

jest.mock('models/aiAgent/queries')
jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName')
jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData',
)

const mockUseUpsertStoreConfigurationPure = assumeMock(
    useUpsertStoreConfigurationPure,
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

        const mockMutate = jest.fn((_, { onSuccess }) => onSuccess?.())

        mockUseUpsertStoreConfigurationPure.mockReturnValue({
            mutate: mockMutate,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpsertStoreConfigurationPure>)

        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useUpdateAIAgentStoreConfigurationData(accountDomain, storeName),
        )

        result.current.updateStoreConfig()

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledTimes(1)
            expect(mockMutate).toHaveBeenCalledWith(
                [
                    accountDomain,
                    {
                        ...mockStoreConfiguration,
                        emailChannelDeactivatedDatetime: null, // Since email integration exists
                        chatChannelDeactivatedDatetime:
                            '2024-03-10T00:00:00.000Z', // Since no chat integration exists
                        scopes: [AiAgentScope.Support], // No chat integration, so no Sales scope
                    },
                ],
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            )
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

        const mockMutate = jest.fn()
        mockUseUpsertStoreConfigurationPure.mockReturnValue({
            mutate: mockMutate,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpsertStoreConfigurationPure>)

        const consoleWarnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(() => {})

        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useUpdateAIAgentStoreConfigurationData(accountDomain, storeName),
        )

        result.current.updateStoreConfig()

        expect(mockMutate).not.toHaveBeenCalled()
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            '🚀 ~ updateStoreConfig: Data is still loading, aborting update',
        )

        consoleWarnSpy.mockRestore()
    })
})
