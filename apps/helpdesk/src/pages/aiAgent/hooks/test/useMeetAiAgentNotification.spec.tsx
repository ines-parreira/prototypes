import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { account } from 'fixtures/account'
import { defaultUseAiAgentOnboardingNotification } from 'fixtures/onboardingStateNotification'
import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { getOnboardingNotificationStateFixture } from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { getHasAutomate } from 'state/billing/selectors'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { useAiAgentOnboardingNotification } from '../useAiAgentOnboardingNotification'
import useMeetAiAgentNotifications from '../useMeetAiAgentNotification'
import { useStoreConfiguration } from '../useStoreConfiguration'

jest.mock('state/billing/selectors')
jest.mock('../useAiAgentOnboardingNotification')
jest.mock('../useStoreConfiguration')
jest.mock('hooks/aiAgent/useGetOrCreateAccountConfiguration')

const mockGetHasAutomate = assumeMock(getHasAutomate)
const mockUseGetOrCreateAccountConfiguration = assumeMock(
    useGetOrCreateAccountConfiguration,
)
const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification,
)
const mockUseStoreConfiguration = assumeMock(useStoreConfiguration)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    currentAccount: fromJS({
        ...account,
        domain: 'test-account',
    }),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'shopify',
                name: 'test-shop1',
                meta: { shop_name: 'test-shop1' },
            },
            {
                id: 2,
                type: 'shopify',
                name: 'test-shop2',
                meta: { shop_name: 'test-shop2' },
            },
        ],
    }),
}

const getDependencyWrapper = (state = defaultState) => {
    const dependencyWrapper: React.ComponentType<any> = ({
        children,
    }: {
        children: React.ReactNode
    }) => (
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>{children}</Provider>
        </QueryClientProvider>
    )

    return dependencyWrapper
}

describe('useMeetAiAgentNotifications', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockGetHasAutomate.mockReturnValue(true)
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'success',
            isLoading: false,
        } as unknown as ReturnType<typeof useGetOrCreateAccountConfiguration>)
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: undefined,
            isFetched: true,
            error: null,
        })
    })

    it('should trigger notification for all stores if conditions are met', () => {
        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(2)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            hasAutomateSubscription: true,
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
            hasAutomateSubscription: true,
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).toHaveBeenCalledTimes(2)
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).toHaveBeenCalledWith({
            aiAgentNotificationType: AiAgentNotificationType.MeetAiAgent,
        })
    })

    it('should not trigger notification if not admin', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isAdmin: false,
        })

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(1)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            hasAutomateSubscription: true,
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if isLoadingOnboardingNotification is true', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isLoading: true,
        })

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(1)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            hasAutomateSubscription: true,
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if isLoadingAccountConfiguration is true', () => {
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'loading',
            isLoading: true,
        } as unknown as ReturnType<typeof useGetOrCreateAccountConfiguration>)

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if accountConfigRetrievalStatus is error', () => {
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'error',
            isLoading: true,
        } as unknown as ReturnType<typeof useGetOrCreateAccountConfiguration>)

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if isAiAgentOnboardingNotificationEnabled is false', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isAiAgentOnboardingNotificationEnabled: false,
        })

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(1)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            hasAutomateSubscription: true,
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if already met AI agent previously', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: getOnboardingNotificationStateFixture({
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
            }),
        })

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(2)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            hasAutomateSubscription: true,
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
            hasAutomateSubscription: true,
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if meet AI agent notification already received', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: getOnboardingNotificationStateFixture({
                meetAiAgentNotificationReceivedDatetime: '2021-01-01T00:00:00Z',
            }),
        })

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(2)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            hasAutomateSubscription: true,
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
            hasAutomateSubscription: true,
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if the store already has storeConfiguration', () => {
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: getStoreConfigurationFixture(),
            isFetched: true,
            error: null,
        })

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(2)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            hasAutomateSubscription: true,
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
            hasAutomateSubscription: true,
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })

    it('should call the custom hooks with enabled false if account does not have AI Agent subscription', () => {
        mockGetHasAutomate.mockReturnValue(false)

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseGetOrCreateAccountConfiguration).toHaveBeenCalledWith(
            {
                accountId: 1,
                accountDomain: 'test-account',
                storeNames: ['test-shop1', 'test-shop2'],
            },
            {
                refetchOnWindowFocus: false,
                enabled: false,
            },
        )

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(2)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            hasAutomateSubscription: false,
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
            hasAutomateSubscription: false,
        })

        expect(mockUseStoreConfiguration).toHaveBeenCalledWith({
            shopName: 'test-shop1',
            accountDomain: 'test-account',
            enabled: false,
        })
    })

    it('should not trigger notification if account does not have AI Agent subscription', () => {
        mockGetHasAutomate.mockReturnValue(false)

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification,
        ).not.toHaveBeenCalled()
    })
})
