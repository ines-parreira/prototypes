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
import { useGetUsedEmailIntegrations } from '../useGetUsedEmailIntegrations'
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

const wrapper = ({ children }: { children?: React.ReactNode }) => {
    ;(useParams as jest.Mock).mockReturnValue({ shopName: 'Test' })
    return (
        <QueryClientProvider client={mockQueryClient()}>
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        </QueryClientProvider>
    )
}

describe('useGetUsedEmailIntegrations', () => {
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
        } as any)

        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [
                {
                    helpCenterId: 123,
                    chatChannelDeactivatedDatetime: '2024-01-01',
                    emailChannelDeactivatedDatetime: '2024-01-01',
                    trialModeActivatedDatetime: '2024-02-01',
                    previewModeActivatedDatetime: '2024-02-01',
                    previewModeValidUntilDatetime: '2024-02-08',
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'email1@example.com' },
                        { id: 3, email: 'email2@example.com' },
                    ],
                    monitoredChatIntegrations: [2, 3],
                    customToneOfVoiceGuidance: 'Be friendly',
                    signature: 'Best regards, Store',
                    silentHandover: true,
                    tags: [],
                    excludedTopics: ['topic1', 'topic2'],
                    ticketSampleRate: 0.5,
                    wizard: undefined,
                } as unknown as StoreConfiguration,
            ],
            isLoading: false,
        })
    })

    it('should return email integrations data', async () => {
        const { result } = renderHook(() => useGetUsedEmailIntegrations(), {
            wrapper,
        })
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

        const { result } = renderHook(() => useGetUsedEmailIntegrations(), {
            wrapper,
        })

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

        const { result } = renderHook(() => useGetUsedEmailIntegrations(), {
            wrapper,
        })

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
                    helpCenterId: 123,
                    chatChannelDeactivatedDatetime: '2024-01-01',
                    emailChannelDeactivatedDatetime: '2024-01-01',
                    trialModeActivatedDatetime: '2024-02-01',
                    previewModeActivatedDatetime: '2024-02-01',
                    previewModeValidUntilDatetime: '2024-02-08',
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'email1@example.com' },
                        { id: 3, email: 'email2@example.com' },
                    ],
                    monitoredChatIntegrations: [2, 3],
                    customToneOfVoiceGuidance: 'Be friendly',
                    signature: 'Best regards, Store',
                    silentHandover: true,
                    tags: [],
                    excludedTopics: ['topic1', 'topic2'],
                    ticketSampleRate: 0.5,
                    wizard: undefined,
                } as unknown as StoreConfiguration,
            ],
            isLoading: false,
        })

        const { result } = renderHook(() => useGetUsedEmailIntegrations(), {
            wrapper,
        })

        expect(result.current).toEqual([2, 3])
    })
})
