import {renderHook, act} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    AI_AGENT_SET_AND_OPTIMIZED_TYPE,
    AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
} from 'automate/notifications/constants'
import {AiAgentNotificationType} from 'automate/notifications/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import {AiAgentOnboardingState} from 'models/aiAgent/types'
import {NotificationEvent} from 'services/notificationTracker/constants'
import * as notificationTracker from 'services/notificationTracker/notificationTracker'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState} from 'state/types'
import {assumeMock} from 'utils/testing'

import {getOnboardingNotificationStateFixture} from '../../fixtures/onboardingNotificationState.fixture'
import {useAiAgentOnboardingNotification} from '../useAiAgentOnboardingNotification'
import {useOnboardingNotificationState} from '../useOnboardingNotificationState'
import {useOnboardingNotificationStateMutation} from '../useOnboardingNotificationStateMutation'

jest.mock('services/notificationTracker/notificationTracker')
jest.mock('../useOnboardingNotificationState')
const mockUseOnboardingnotificationState = assumeMock(
    useOnboardingNotificationState
)
jest.mock('../useOnboardingNotificationStateMutation')
const mockUseOnboardingNotificationStateMutation = assumeMock(
    useOnboardingNotificationStateMutation
)

jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch', () => jest.fn())
const mockUseAppDispatch = assumeMock(useAppDispatch)

const ACCOUNT_DOMAIN = 'account-domain'
const SHOP_NAME = 'shop-name'
const mockedOnboardingNotificationState = getOnboardingNotificationStateFixture(
    {
        shopName: SHOP_NAME,
    }
)

const defaultState: Partial<RootState> = {
    currentAccount: fromJS({
        ...account,
        domain: ACCOUNT_DOMAIN,
    }),
    currentUser: fromJS(user),
} as unknown as RootState
const mockStore = configureMockStore([thunk])

describe('useAiAgentOnboardingNotification', () => {
    const mockDispatch = jest.fn()
    const mockCreateOnboardingNotificationState = jest
        .fn()
        .mockResolvedValue({mockedOnboardingNotificationState})
    const mockUpsertOnboardingNotificationState = jest
        .fn()
        .mockResolvedValue({mockedOnboardingNotificationState})

    beforeEach(() => {
        jest.resetAllMocks()
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingNotification]: true,
        })
        mockUseAppDispatch.mockReturnValue(mockDispatch)

        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: undefined,
            isLoading: false,
        })

        mockUseOnboardingNotificationStateMutation.mockReturnValue({
            isLoading: false,
            createOnboardingNotificationState:
                mockCreateOnboardingNotificationState,
            upsertOnboardingNotificationState:
                mockUpsertOnboardingNotificationState,
            error: null,
        })
    })

    it('should return isAdmin and isAiAgentOnboardingNotificationEnabled correctly', () => {
        const {result} = renderHook(
            () => useAiAgentOnboardingNotification({shopName: SHOP_NAME}),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(result.current.isAdmin).toBe(true)
        expect(result.current.isAiAgentOnboardingNotificationEnabled).toBe(true)
    })

    it('should handle save (createOnboardingNotificationState) without error', async () => {
        const {result} = renderHook(
            () => useAiAgentOnboardingNotification({shopName: SHOP_NAME}),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        const payload = {
            onboardingState: AiAgentOnboardingState.Activated,
        }

        await act(async () => {
            await result.current.handleOnSave(payload)
        })

        expect(mockCreateOnboardingNotificationState).toHaveBeenCalledWith({
            ...payload,
            shopName: SHOP_NAME,
        })
        expect(mockDispatch).not.toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Error,
                message: 'Failed to save onboarding notification state',
            })
        )
    })

    it('should handle save (updateOnboardingNotificationState) without error', async () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: mockedOnboardingNotificationState,
            isLoading: false,
        })

        const {result} = renderHook(
            () => useAiAgentOnboardingNotification({shopName: SHOP_NAME}),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        const payload = {
            onboardingState: AiAgentOnboardingState.Activated,
        }

        await act(async () => {
            await result.current.handleOnSave(payload)
        })

        expect(mockUpsertOnboardingNotificationState).toHaveBeenCalledWith({
            ...mockedOnboardingNotificationState,
            ...payload,
        })
        expect(mockDispatch).not.toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Error,
                message: 'Failed to save onboarding notification state',
            })
        )
    })

    it('should handle save with error', async () => {
        const mockErrorCreateOnboardingNotificationState = jest
            .fn()
            .mockRejectedValueOnce(new Error('Save error'))
        mockUseOnboardingNotificationStateMutation.mockReturnValue({
            isLoading: false,
            createOnboardingNotificationState:
                mockErrorCreateOnboardingNotificationState,
            upsertOnboardingNotificationState:
                mockUpsertOnboardingNotificationState,
            error: null,
        })

        const {result} = renderHook(
            () => useAiAgentOnboardingNotification({shopName: SHOP_NAME}),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        const payload = {
            onboardingState: AiAgentOnboardingState.Activated,
        }

        await act(async () => {
            await result.current.handleOnSave(payload)
        })

        expect(mockErrorCreateOnboardingNotificationState).toHaveBeenCalledWith(
            {
                ...payload,
                shopName: SHOP_NAME,
            }
        )
        expect(mockDispatch).toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Error,
                message: 'Failed to save onboarding notification state',
            })
        )
    })

    it('should log notification event when handleOnSendOrCancelNotification is called', () => {
        const logEventSpy = jest.spyOn(
            notificationTracker,
            'logNotificationEvent'
        )

        const {result} = renderHook(
            () => useAiAgentOnboardingNotification({shopName: SHOP_NAME}),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        const notificationType = AiAgentNotificationType.FirstAiAgentTicket

        act(() => {
            result.current.handleOnSendOrCancelNotification({
                aiAgentNotificationType: notificationType,
            })
        })

        expect(logEventSpy).toHaveBeenCalledWith(NotificationEvent, {
            command_type: 'send-notification',
            notification_workflow: AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
            notification_type: AI_AGENT_SET_AND_OPTIMIZED_TYPE,
            idempotency_key: `idempotency:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${notificationType}`,
            notification_data: {
                ai_agent_notification_type: notificationType,
                shop_name: SHOP_NAME,
                shop_type: 'shopify',
            },
            cancellation_key: `cancel:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${notificationType}`,
        })
    })
})
