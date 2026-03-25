import type React from 'react'

import { renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import type { OnboardingData } from 'models/aiAgent/types'
import type { ShopifyIntegration } from 'models/integration/types'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import type {
    StoreConfiguration,
    StoreConfigurationsResponse,
} from '../../../../models/aiAgent/types'
import { useGetOnboardings } from '../../Onboarding_V2/hooks/useGetOnboardings'
import { useGetAlreadyUsedEmailIntegrationIds } from '../useGetAlreadyUsedEmailIntegrationIds'

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardings')
const useGetOnboardingsMock = jest.mocked(useGetOnboardings)

jest.mock('models/aiAgent/queries')
const useGetStoresConfigurationForAccountMock = jest.mocked(
    useGetStoresConfigurationForAccount,
)

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

// Create additional shopify integrations for testing
const additionalShopifyIntegrations: ShopifyIntegration[] = [
    { ...shopifyIntegration, name: 'test-shop' },
    { ...shopifyIntegration, name: 'other-shop' },
    { ...shopifyIntegration, name: "Another shop's name" },
]

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [
            ...additionalShopifyIntegrations,
            ...chatIntegrationFixtures,
        ],
    }),
} as RootState

const defaultOnboardingData: OnboardingData = {
    id: '1',
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
    shopName: 'acme',
    currentStepName: 'channels',
    emailIntegrationIds: [],
    chatIntegrationIds: [],
    completedDatetime: undefined,
}

const defaultStoreConfiguration: StoreConfiguration = {
    storeName: 'test-shop',
    helpCenterId: 123,
    chatChannelDeactivatedDatetime: '2024-01-01',
    emailChannelDeactivatedDatetime: '2024-01-01',
    previewModeActivatedDatetime: '2024-02-01',
    previewModeValidUntilDatetime: '2024-02-08',
    monitoredEmailIntegrations: [],
    monitoredChatIntegrations: [],
    customToneOfVoiceGuidance: 'Be friendly',
    signature: 'Best regards, Store',
    silentHandover: true,
    tags: [],
    excludedTopics: [],
} as unknown as StoreConfiguration

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={mockQueryClient()}>
        <Provider store={mockStore(defaultState)}>{children}</Provider>
    </QueryClientProvider>
)

describe('useGetAlreadyUsedEmailIntegrationIds', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        useGetOnboardingsMock.mockReturnValue({
            data: [
                {
                    ...defaultOnboardingData,
                    shopName: "Another shop's name",
                    emailIntegrationIds: [1, 15],
                },
            ],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [
                    {
                        ...defaultStoreConfiguration,
                        monitoredEmailIntegrations: [
                            { id: 2, email: 'email1@example.com' },
                            { id: 3, email: 'email2@example.com' },
                        ],
                    },
                ],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)
    })

    it('should return email integrations data', async () => {
        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds(),
            {
                wrapper,
            },
        )
        expect(result.current).toEqual([2, 3, 1, 15])
    })

    it('should return email integrations data when there is none', async () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [] as OnboardingData[],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [] as StoreConfiguration[],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds(),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual([])
    })

    it('should return email integrations data when there is only in onboardings', async () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [
                {
                    ...defaultOnboardingData,
                    shopName: "Another shop's name",
                    emailIntegrationIds: [1, 15],
                },
            ],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [] as StoreConfiguration[],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds(),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual([1, 15])
    })

    it('should return email integrations data when there is only in storeConfigurations', async () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [] as OnboardingData[],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [
                    {
                        ...defaultStoreConfiguration,
                        monitoredEmailIntegrations: [
                            { id: 2, email: 'email1@example.com' },
                            { id: 3, email: 'email2@example.com' },
                        ],
                    },
                ],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds(),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual([2, 3])
    })

    it('should only return emails from other storeConfigurations that exist in shopify integrations', async () => {
        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [
                    {
                        ...defaultStoreConfiguration,
                        storeName: 'current-shop', // This should be filtered out by currentStoreName
                        monitoredEmailIntegrations: [
                            { id: 1, email: 'email1@example.com' },
                            { id: 2, email: 'email2@example.com' },
                        ],
                    },
                    {
                        ...defaultStoreConfiguration,
                        storeName: 'other-shop', // This exists in shopify integrations and is different from current
                        monitoredEmailIntegrations: [
                            { id: 3, email: 'email3@example.com' },
                            { id: 4, email: 'email4@example.com' },
                        ],
                    },
                    {
                        ...defaultStoreConfiguration,
                        storeName: 'non-existing-shop', // This does NOT exist in shopify integrations
                        monitoredEmailIntegrations: [
                            { id: 5, email: 'email5@example.com' },
                            { id: 6, email: 'email6@example.com' },
                        ],
                    },
                ],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)

        useGetOnboardingsMock.mockReturnValue({
            data: [] as OnboardingData[],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds('current-shop'),
            {
                wrapper,
            },
        )

        // Only emails from 'other-shop' should be returned (IDs 3, 4)
        // 'current-shop' is filtered out by currentStoreName
        // 'non-existing-shop' is filtered out because it doesn't exist in shopify integrations
        expect(result.current).toEqual([3, 4])
    })

    it('should only return emails from onboardings that exist in shopify integrations', async () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [
                {
                    ...defaultOnboardingData,
                    shopName: 'current-shop', // Should be filtered out - same as current
                    emailIntegrationIds: [1, 2],
                },
                {
                    ...defaultOnboardingData,
                    shopName: 'other-shop', // Should be included - exists in shopify integrations and different from current
                    emailIntegrationIds: [3, 4],
                },
                {
                    ...defaultOnboardingData,
                    shopName: 'non-existing-shop', // Should be filtered out - doesn't exist in shopify integrations
                    emailIntegrationIds: [5, 6],
                },
            ],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [] as StoreConfiguration[],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds('current-shop'),
            { wrapper },
        )

        // Only emails from 'other-shop' should be returned (IDs 3, 4)
        // 'current-shop' is filtered out by currentStoreName
        // 'non-existing-shop' is filtered out because it doesn't exist in shopify integrations
        expect(result.current).toEqual([3, 4])
    })

    it('should filter out store configurations that do not exist in shopify integrations', async () => {
        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [
                    {
                        ...defaultStoreConfiguration,
                        storeName: 'existing-shop-in-shopify', // This doesn't exist in our shopify integrations
                        monitoredEmailIntegrations: [
                            { id: 1, email: 'email1@example.com' },
                        ],
                    },
                    {
                        ...defaultStoreConfiguration,
                        storeName: 'test-shop', // This exists in our shopify integrations
                        monitoredEmailIntegrations: [
                            { id: 2, email: 'email2@example.com' },
                        ],
                    },
                ],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)

        useGetOnboardingsMock.mockReturnValue({
            data: [] as OnboardingData[],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds('current-shop'),
            { wrapper },
        )

        // Only email from 'test-shop' should be returned (ID 2) because it exists in shopify integrations
        // 'existing-shop-in-shopify' should be filtered out because it doesn't exist in shopify integrations
        expect(result.current).toEqual([2])
    })

    it('should exclude completed onboardings from already used email integrations', async () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [
                {
                    ...defaultOnboardingData,
                    shopName: 'test-shop',
                    emailIntegrationIds: [1, 2],
                    completedDatetime: '2024-01-01T00:00:00',
                },
                {
                    ...defaultOnboardingData,
                    shopName: 'other-shop',
                    emailIntegrationIds: [3, 4],
                    completedDatetime: undefined,
                },
            ],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [
                    {
                        ...defaultStoreConfiguration,
                        storeName: 'test-shop',
                        monitoredEmailIntegrations: [
                            { id: 1, email: 'email2@example.com' },
                        ],
                    },
                ] as StoreConfiguration[],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds('current-shop'),
            { wrapper },
        )

        // Email integration 1 is used because it's part of the store configuration of other-shop
        // Email integration 2 is not used because the onboarding of test-shop is complete and thus ignored
        // Email integrations 3 and 4 are used because they are part of the onboarding of other-shop
        expect(result.current).toEqual([1, 3, 4])
    })

    it('should return no email integration IDs when there is an onboarding without shop name', async () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [
                {
                    ...defaultOnboardingData,
                    shopName: undefined,
                    emailIntegrationIds: [1],
                    completedDatetime: '2024-01-01T00:00:00',
                },
            ],
            isLoading: false,
        } as UseQueryResult<OnboardingData[]>)

        useGetStoresConfigurationForAccountMock.mockReturnValue({
            data: {
                storeConfigurations: [] as StoreConfiguration[],
            },
            isLoading: false,
        } as UseQueryResult<StoreConfigurationsResponse>)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrationIds(),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual([])
    })
})
