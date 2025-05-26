import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { StoreConfiguration } from '../../../../models/aiAgent/types'
import { assumeMock } from '../../../../utils/testing'
import { useGetOnboardings } from '../../Onboarding/hooks/useGetOnboardings'
import { useGetAlreadyUsedEmailIntegrations } from '../useGetAlreadyUsedEmailIntegrations'
import { useStoreConfigurationForAccount } from '../useStoreConfigurationForAccount'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardings')
const useGetOnboardingsMock = assumeMock(useGetOnboardings)
jest.mock('pages/aiAgent/hooks/useStoreConfigurationForAccount')
const useStoreConfigurationForAccountMock = assumeMock(
    useStoreConfigurationForAccount,
)

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const defaultOnboardingData = {
    id: 1,
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
    shopName: 'acme',
    currentStepName: 'channels',
    emailIntegrationIds: [],
    chatIntegrationIds: [],
}

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const useParamsMock = jest.mocked(useParams)

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={mockQueryClient()}>
        <Provider store={mockStore(defaultState)}>{children}</Provider>
    </QueryClientProvider>
)

describe('useGetAlreadyUsedEmailIntegrations', () => {
    const defaultStoreConfiguration = {
        storeName: 'test-shop',
        helpCenterId: 123,
        chatChannelDeactivatedDatetime: '2024-01-01',
        emailChannelDeactivatedDatetime: '2024-01-01',
        trialModeActivatedDatetime: '2024-02-01',
        previewModeActivatedDatetime: '2024-02-01',
        previewModeValidUntilDatetime: '2024-02-08',
        monitoredEmailIntegrations: [],
        monitoredChatIntegrations: [],
        customToneOfVoiceGuidance: 'Be friendly',
        signature: 'Best regards, Store',
        silentHandover: true,
        tags: [],
        excludedTopics: [],
    }
    beforeEach(() => {
        jest.resetAllMocks()

        useParamsMock.mockReturnValue({ shopName: 'Test' })

        useGetOnboardingsMock.mockReturnValue({
            data: [
                {
                    ...defaultOnboardingData,
                    shopName: "Another shop's name",
                    emailIntegrationIds: [1, 15],
                },
            ],
            isLoading: false,
        } as any)

        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [
                {
                    ...defaultStoreConfiguration,
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'email1@example.com' },
                        { id: 3, email: 'email2@example.com' },
                    ],
                } as unknown as StoreConfiguration,
            ],
            isLoading: false,
        })
    })

    it('should return email integrations data', async () => {
        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrations(),
            {
                wrapper,
            },
        )
        expect(result.current).toEqual([2, 3, 1, 15])
    })

    it('should return email integrations data when there is none', async () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [],
            isLoading: false,
        } as any)

        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [],
            isLoading: false,
        })

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrations(),
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
        } as any)

        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [],
            isLoading: false,
        })

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrations(),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual([1, 15])
    })

    it('should return email integrations data when there is only in storeConfigurations', async () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [],
            isLoading: false,
        } as any)

        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [
                {
                    ...defaultStoreConfiguration,
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'email1@example.com' },
                        { id: 3, email: 'email2@example.com' },
                    ],
                } as unknown as StoreConfiguration,
            ],
            isLoading: false,
        })

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrations(),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual([2, 3])
    })

    it('should only return emails from other storeConfigurations', async () => {
        useParamsMock.mockReturnValue({ shopName: 'current-shop' })

        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [
                {
                    ...defaultStoreConfiguration,
                    storeName: 'current-shop',
                    monitoredEmailIntegrations: [
                        { id: 1, email: 'email1@example.com' },
                        { id: 2, email: 'email2@example.com' },
                    ],
                } as unknown as StoreConfiguration, // Should be filtered out - same as current
                {
                    ...defaultStoreConfiguration,
                    storeName: 'other-shop',
                    monitoredEmailIntegrations: [
                        { id: 3, email: 'email3@example.com' },
                        { id: 4, email: 'email4@example.com' },
                    ],
                } as unknown as StoreConfiguration, // Should be included - different from current
            ],
            isLoading: false,
        })

        useGetOnboardingsMock.mockReturnValue({
            data: [],
            isLoading: false,
        } as any)

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrations(),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual([3, 4])
    })

    it('should only return emails from other onboardings', async () => {
        useParamsMock.mockReturnValue({ shopName: 'current-shop' })

        useGetOnboardingsMock.mockReturnValue({
            data: [
                {
                    ...defaultOnboardingData,
                    shopName: 'current-shop', // Should be filtered out - same as current
                    emailIntegrationIds: [1, 2],
                },
                {
                    ...defaultOnboardingData,
                    shopName: 'other-shop', // Should be included - different from current
                    emailIntegrationIds: [3, 4],
                },
            ],
            isLoading: false,
        } as any)

        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [],
            isLoading: false,
        })

        const { result } = renderHook(
            () => useGetAlreadyUsedEmailIntegrations('current-shop'),
            { wrapper },
        )

        expect(result.current).toEqual([3, 4])
    })
})
