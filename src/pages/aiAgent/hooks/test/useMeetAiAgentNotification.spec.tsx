import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {AiAgentNotificationType} from 'automate/notifications/types'
import {account} from 'fixtures/account'
import {AiAgentOnboardingState} from 'models/aiAgent/types'
import {getOnboardingNotificationStateFixture} from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import {getStoreConfigurationFixture} from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import {getHasAutomate} from 'state/billing/selectors'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {useAiAgentOnboardingNotification} from '../useAiAgentOnboardingNotification'
import useMeetAiAgentNotifications from '../useMeetAiAgentNotification'
import {useStoreConfiguration} from '../useStoreConfiguration'

jest.mock('state/billing/selectors')
jest.mock('../useAiAgentOnboardingNotification')
jest.mock('../useStoreConfiguration')

const mockGetHasAutomate = assumeMock(getHasAutomate)
const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification
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
                meta: {shop_name: 'test-shop1'},
            },
            {
                id: 2,
                type: 'shopify',
                name: 'test-shop2',
                meta: {shop_name: 'test-shop2'},
            },
        ],
    }),
}

const getDependencyWrapper = (state = defaultState) => {
    const dependencyWrapper: React.ComponentType<any> = ({
        children,
    }: {
        children: Element
    }) => (
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>{children}</Provider>
        </QueryClientProvider>
    )

    return dependencyWrapper
}

const defaultUseAiAgentOnboardingNotification = {
    isAdmin: true,
    onboardingNotificationState: undefined,
    handleOnSave: jest.fn(),
    handleOnSendOrCancelNotification: jest.fn(),
    handleOnEnablementPostReceivedNotification: jest.fn(),
    handleOnPerformActionPostReceivedNotification: jest.fn(),
    isLoading: false,
    isAiAgentOnboardingNotificationEnabled: true,
}

describe('useMeetAiAgentNotifications', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockGetHasAutomate.mockReturnValue(true)
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification
        )
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: undefined,
        })
    })

    it('should trigger notification for all stores if conditions are met', () => {
        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(2)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).toHaveBeenCalledTimes(2)
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
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
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if isLoading is true', () => {
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
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
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
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
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
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
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
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if the store already has storeConfiguration', () => {
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: getStoreConfigurationFixture(),
        })

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(2)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger notification if account does not have Automate subscription', () => {
        mockGetHasAutomate.mockReturnValue(false)

        renderHook(() => useMeetAiAgentNotifications(), {
            wrapper: getDependencyWrapper(),
        })

        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledTimes(2)
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop1',
        })
        expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
            shopName: 'test-shop2',
        })
        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })
})
