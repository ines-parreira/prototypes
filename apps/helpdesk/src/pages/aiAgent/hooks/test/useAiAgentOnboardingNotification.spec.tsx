import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    AI_AGENT_SET_AND_OPTIMIZED_TYPE,
    AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
} from 'automate/notifications/constants'
import { AiAgentNotificationType } from 'automate/notifications/types'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import { getOnboardingNotificationState } from 'models/aiAgent/resources/configuration'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { NotificationEvent } from 'services/notificationTracker/constants'
import * as notificationTracker from 'services/notificationTracker/notificationTracker'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RootState } from 'state/types'

import { getOnboardingNotificationStateFixture } from '../../fixtures/onboardingNotificationState.fixture'
import {
    NUMBER_OF_MILLISECONDS_IN_A_DAY,
    useAiAgentOnboardingNotification,
} from '../useAiAgentOnboardingNotification'
import { useOnboardingNotificationState } from '../useOnboardingNotificationState'
import { useOnboardingNotificationStateMutation } from '../useOnboardingNotificationStateMutation'

jest.mock(
    '@repo/logging',
    () =>
        ({
            ...jest.requireActual('@repo/logging'),
            logEvent: jest.fn(),
        }) as typeof import('@repo/logging'),
)

jest.mock('services/notificationTracker/notificationTracker')
jest.mock('../useOnboardingNotificationState')
const mockUseOnboardingnotificationState = assumeMock(
    useOnboardingNotificationState,
)
jest.mock('../useOnboardingNotificationStateMutation')
const mockUseOnboardingNotificationStateMutation = assumeMock(
    useOnboardingNotificationStateMutation,
)

jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch', () => jest.fn())
const mockUseAppDispatch = assumeMock(useAppDispatch)

jest.mock('models/aiAgent/resources/configuration', () => ({
    getOnboardingNotificationState: jest.fn(),
}))

const mockGetOnboardingNotificationState =
    getOnboardingNotificationState as jest.Mock

const ACCOUNT_DOMAIN = 'account-domain'
const SHOP_NAME = 'shop-name'
const mockedOnboardingNotificationState = getOnboardingNotificationStateFixture(
    {
        shopName: SHOP_NAME,
    },
)

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

const defaultState: Partial<RootState> = {
    currentAccount: fromJS({
        ...account,
        domain: ACCOUNT_DOMAIN,
    }),
    currentUser: fromJS(user),
} as unknown as RootState
const mockStore = configureMockStore([thunk])

describe('useAiAgentOnboardingNotification', () => {
    const logEventSpy = jest.spyOn(notificationTracker, 'logNotificationEvent')
    const mockDispatch = jest.fn()
    const mockCreateOnboardingNotificationState = jest
        .fn()
        .mockResolvedValue({ mockedOnboardingNotificationState })
    const mockUpsertOnboardingNotificationState = jest
        .fn()
        .mockResolvedValue({ mockedOnboardingNotificationState })

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiAgentOnboardingNotification || false,
        )
        mockUseAppDispatch.mockReturnValue(mockDispatch)

        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: mockedOnboardingNotificationState,
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
        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.isAdmin).toBe(true)
        expect(result.current.isAiAgentOnboardingNotificationEnabled).toBe(true)
    })

    it('should handle save without error', async () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: mockedOnboardingNotificationState,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
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
            }),
        )
    })

    it('should handle save with error', async () => {
        const mockErrorUpsertOnboardingNotificationState = jest
            .fn()
            .mockRejectedValueOnce(new Error('Save error'))
        mockUseOnboardingNotificationStateMutation.mockReturnValue({
            isLoading: false,
            createOnboardingNotificationState:
                mockCreateOnboardingNotificationState,
            upsertOnboardingNotificationState:
                mockErrorUpsertOnboardingNotificationState,
            error: null,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        const payload = {
            ...mockedOnboardingNotificationState,
            onboardingState: AiAgentOnboardingState.Activated,
        }

        await act(async () => {
            await result.current.handleOnSave(payload)
        })

        expect(mockErrorUpsertOnboardingNotificationState).toHaveBeenCalledWith(
            {
                ...payload,
                shopName: SHOP_NAME,
            },
        )
        expect(mockDispatch).toHaveBeenCalledWith(
            notify({
                status: NotificationStatus.Error,
                message: 'Failed to save onboarding notification state',
            }),
        )
    })

    it('should log notification event when handleOnSendOrCancelNotification is called', () => {
        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
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
            idempotency_key: expect.stringContaining(
                `idempotent:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${notificationType}`,
            ),
            notification_data: {
                ai_agent_notification_type: notificationType,
                shop_name: SHOP_NAME,
                shop_type: 'shopify',
            },
            cancellation_key: `cancel:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${notificationType}`,
        })
    })

    it('should log notification segment event when handleOnSendOrCancelNotification is called', () => {
        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        const notificationType = AiAgentNotificationType.FirstAiAgentTicket

        act(() => {
            result.current.handleOnSendOrCancelNotification({
                aiAgentNotificationType: notificationType,
            })
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentOnboardingNotificationTriggered,
            {
                type: notificationType,
            },
        )
    })

    it('should not log notification segment event if handleOnSendOrCancelNotification is called to cancel the call', () => {
        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        const notificationType = AiAgentNotificationType.FirstAiAgentTicket

        act(() => {
            result.current.handleOnSendOrCancelNotification({
                aiAgentNotificationType: notificationType,
                isCancel: true,
            })
        })

        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should not call updateOnboardingNotificationState when shopName is not provided', async () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: mockedOnboardingNotificationState,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: undefined }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        const payload = {
            onboardingState: AiAgentOnboardingState.Activated,
        }

        await act(async () => {
            await result.current.handleOnSave(payload)
        })

        expect(mockUpsertOnboardingNotificationState).not.toHaveBeenCalled()
    })

    it('should log enablement post received notification event when handleOnEnablementPostReceivedNotification is called', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                activateAiAgentNotificationReceivedDatetime: new Date(
                    Date.now() - 7 * NUMBER_OF_MILLISECONDS_IN_A_DAY,
                ).toISOString(),
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnEnablementPostReceivedNotification()
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentEnablementPostReceivedOnboardingNotification,
        )
    })

    it('should not log enablement post received notification event if no recent notification received', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: mockedOnboardingNotificationState,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnEnablementPostReceivedNotification()
        })

        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should not log enablement post received notification event if notification received long time ago', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                activateAiAgentNotificationReceivedDatetime: new Date(
                    Date.now() - 20 * NUMBER_OF_MILLISECONDS_IN_A_DAY,
                ).toISOString(),
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnEnablementPostReceivedNotification()
        })

        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should not log enablement post received notification event if no onboardingNotificationState in database', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnEnablementPostReceivedNotification()
        })

        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should log perform action post received notification event when handleOnPerformActionPostReceivedNotification is called', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                finishAiAgentSetupNotificationReceivedDatetime: new Date(
                    Date.now() - 7 * NUMBER_OF_MILLISECONDS_IN_A_DAY,
                ).toISOString(),
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnPerformActionPostReceivedNotification(
                AiAgentNotificationType.FinishAiAgentSetup,
            )
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentActionPerformedPostReceivedOnboardingNotification,
            {
                type: AiAgentNotificationType.FinishAiAgentSetup,
            },
        )
    })

    it('should not log perform action post received notification event if no recent notification received', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: mockedOnboardingNotificationState,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnPerformActionPostReceivedNotification(
                AiAgentNotificationType.StartAiAgentSetup,
            )
        })

        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should not log perform action post received notification event if notification received long time ago', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                finishAiAgentSetupNotificationReceivedDatetime: new Date(
                    Date.now() - 20 * NUMBER_OF_MILLISECONDS_IN_A_DAY,
                ).toISOString(),
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnPerformActionPostReceivedNotification(
                AiAgentNotificationType.FinishAiAgentSetup,
            )
        })

        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should not log perform action post received notification event if no onboardingNotificationState in database', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnPerformActionPostReceivedNotification(
                AiAgentNotificationType.FinishAiAgentSetup,
            )
        })

        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should trigger call to send activate AI agent notification when handleOnTriggerActivateAiAgentNotification is called', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.FinishedSetup,
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnTriggerActivateAiAgentNotification()
        })

        const notificationType = AiAgentNotificationType.ActivateAiAgent

        expect(logEventSpy).toHaveBeenCalledWith(NotificationEvent, {
            command_type: 'send-notification',
            notification_workflow: AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
            notification_type: AI_AGENT_SET_AND_OPTIMIZED_TYPE,
            idempotency_key: expect.stringContaining(
                `idempotent:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${notificationType}`,
            ),
            notification_data: {
                ai_agent_notification_type: notificationType,
                shop_name: SHOP_NAME,
                shop_type: 'shopify',
            },
            cancellation_key: `cancel:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${notificationType}`,
        })
    })

    it('should not trigger call to send activate AI agent notification when AiAgentOnboardingNotification feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.FinishedSetup,
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnTriggerActivateAiAgentNotification()
        })

        expect(logEventSpy).not.toHaveBeenCalled()
    })

    it('should not trigger call to send activate AI agent notification when onboarding state is already activated', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.Activated,
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnTriggerActivateAiAgentNotification()
        })

        expect(logEventSpy).not.toHaveBeenCalled()
    })

    it('should not trigger call to send activate AI agent notification when onboarding state is already fully onboarded', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.FullyOnboarded,
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnTriggerActivateAiAgentNotification()
        })

        expect(logEventSpy).not.toHaveBeenCalled()
    })

    it('should not trigger call to send activate AI agent notification when activate notification is already received', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                activateAiAgentNotificationReceivedDatetime:
                    new Date().toISOString(),
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnTriggerActivateAiAgentNotification()
        })

        expect(logEventSpy).not.toHaveBeenCalled()
    })

    it('should trigger call to cancel activate AI agent notification when handleOnCancelActivateAiAgentNotification is called', () => {
        const mockedValue = {
            ...mockedOnboardingNotificationState,
            activateAiAgentNotificationReceivedDatetime: new Date(
                Date.now() - 7 * NUMBER_OF_MILLISECONDS_IN_A_DAY,
            ).toISOString(),
            onboardingState: AiAgentOnboardingState.FinishedSetup,
        }

        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: mockedValue,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnCancelActivateAiAgentNotification()
        })

        const notificationType = AiAgentNotificationType.ActivateAiAgent

        expect(logEventSpy).toHaveBeenCalledWith(NotificationEvent, {
            command_type: 'cancel-notification',
            notification_workflow: AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
            notification_type: AI_AGENT_SET_AND_OPTIMIZED_TYPE,
            idempotency_key: expect.stringContaining(
                `idempotent:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${notificationType}`,
            ),
            notification_data: {},
            cancellation_key: `cancel:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${notificationType}`,
        })

        expect(mockUpsertOnboardingNotificationState).toHaveBeenCalledWith({
            ...mockedValue,
            onboardingState: AiAgentOnboardingState.Activated,
            firstActivationDatetime: expect.any(String),
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentEnablementPostReceivedOnboardingNotification,
        )

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentActionPerformedPostReceivedOnboardingNotification,
            {
                type: AiAgentNotificationType.ActivateAiAgent,
            },
        )
    })

    it('should not trigger call to cancel activate AI agent notification when AiAgentOnboardingNotification feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.FinishedSetup,
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnCancelActivateAiAgentNotification()
        })

        expect(logEventSpy).not.toHaveBeenCalled()
        expect(mockUpsertOnboardingNotificationState).not.toHaveBeenCalled()
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should not trigger call to cancel activate AI agent notification when onboarding state is already activated', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.Activated,
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnCancelActivateAiAgentNotification()
        })

        expect(logEventSpy).not.toHaveBeenCalled()
        expect(mockUpsertOnboardingNotificationState).not.toHaveBeenCalled()
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should not trigger call to cancel activate AI agent notification when onboarding state is already fully onboarded', () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.FullyOnboarded,
            },
            isLoading: false,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        act(() => {
            result.current.handleOnCancelActivateAiAgentNotification()
        })

        expect(logEventSpy).not.toHaveBeenCalled()
        expect(mockUpsertOnboardingNotificationState).not.toHaveBeenCalled()
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should trigger trial request notification with correct parameters', async () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.FullyOnboarded,
            },
            isLoading: false,
        })

        const mockOnboardingState = getOnboardingNotificationStateFixture({
            shopName: SHOP_NAME,
        })

        mockGetOnboardingNotificationState.mockResolvedValue({
            data: {
                onboardingNotificationState: mockOnboardingState,
            },
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        await act(async () => {
            await result.current.handleOnTriggerTrialRequestNotification(
                AiAgentNotificationType.AiAgentTrialRequest,
            )
        })

        expect(mockGetOnboardingNotificationState).toHaveBeenCalledWith(
            ACCOUNT_DOMAIN,
            SHOP_NAME,
        )
    })

    it('should trigger trial request notification when feature flag is enabled', async () => {
        mockUseOnboardingnotificationState.mockReturnValue({
            onboardingNotificationState: {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.FullyOnboarded,
            },
            isLoading: false,
        })

        const mockOnboardingState = getOnboardingNotificationStateFixture({
            shopName: SHOP_NAME,
        })

        mockGetOnboardingNotificationState.mockResolvedValue({
            data: {
                onboardingNotificationState: mockOnboardingState,
            },
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        await act(async () => {
            await result.current.handleOnTriggerTrialRequestNotification(
                AiAgentNotificationType.AiAgentTrialRequest,
            )
        })

        expect(mockGetOnboardingNotificationState).toHaveBeenCalledWith(
            ACCOUNT_DOMAIN,
            SHOP_NAME,
        )
        expect(mockUpsertOnboardingNotificationState).toHaveBeenCalled()
    })

    it('should not trigger trial request notification when feature flag is disabled', async () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        await act(async () => {
            await result.current.handleOnTriggerTrialRequestNotification(
                AiAgentNotificationType.AiAgentTrialRequest,
            )
        })

        expect(mockGetOnboardingNotificationState).not.toHaveBeenCalled()
        expect(logEventSpy).not.toHaveBeenCalled()
        expect(mockUpsertOnboardingNotificationState).not.toHaveBeenCalled()
    })

    it('should not trigger trial request notification when shopName is not provided', async () => {
        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: undefined }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        await act(async () => {
            await result.current.handleOnTriggerTrialRequestNotification(
                AiAgentNotificationType.AiAgentTrialRequest,
            )
        })

        expect(mockGetOnboardingNotificationState).not.toHaveBeenCalled()
        expect(logEventSpy).not.toHaveBeenCalled()
        expect(mockUpsertOnboardingNotificationState).not.toHaveBeenCalled()
    })

    it('should trigger shopping assistant trial request notification with correct parameters', async () => {
        const mockOnboardingState = getOnboardingNotificationStateFixture({
            shopName: SHOP_NAME,
        })

        mockGetOnboardingNotificationState.mockResolvedValue({
            data: {
                onboardingNotificationState: mockOnboardingState,
            },
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        await act(async () => {
            await result.current.handleOnTriggerTrialRequestNotification(
                AiAgentNotificationType.AiShoppingAssistantTrialRequest,
            )
        })

        expect(mockGetOnboardingNotificationState).toHaveBeenCalledWith(
            ACCOUNT_DOMAIN,
            SHOP_NAME,
        )
        expect(logEventSpy).toHaveBeenCalledWith(NotificationEvent, {
            command_type: 'send-notification',
            notification_workflow: AI_AGENT_SET_AND_OPTIMIZED_WORKFLOW,
            notification_type: AI_AGENT_SET_AND_OPTIMIZED_TYPE,
            idempotency_key: expect.stringContaining(
                `idempotent:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${AiAgentNotificationType.AiShoppingAssistantTrialRequest}+${user.id}`,
            ),
            notification_data: {
                ai_agent_notification_type:
                    AiAgentNotificationType.AiShoppingAssistantTrialRequest,
                shop_name: SHOP_NAME,
                shop_type: 'shopify',
                agent_id: user.id,
            },
            cancellation_key: `cancel:${ACCOUNT_DOMAIN}+${SHOP_NAME}+${AiAgentNotificationType.AiShoppingAssistantTrialRequest}+${user.id}`,
        })
        expect(mockUpsertOnboardingNotificationState).toHaveBeenCalled()
    })

    it('should handle error when getOnboardingNotificationState fails', async () => {
        mockGetOnboardingNotificationState.mockRejectedValueOnce(
            new Error('API Error'),
        )

        const { result } = renderHook(
            () => useAiAgentOnboardingNotification({ shopName: SHOP_NAME }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        await act(async () => {
            await expect(
                result.current.handleOnTriggerTrialRequestNotification(
                    AiAgentNotificationType.AiAgentTrialRequest,
                ),
            ).rejects.toThrow('API Error')
        })

        expect(mockGetOnboardingNotificationState).toHaveBeenCalledWith(
            ACCOUNT_DOMAIN,
            SHOP_NAME,
        )
        expect(mockUpsertOnboardingNotificationState).not.toHaveBeenCalled()
    })
})
