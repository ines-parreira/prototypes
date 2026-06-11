import { act, assumeMock, renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useCreateAiShoppingAssistantTrialRequest } from '@gorgias/helpdesk-queries'

import { AiAgentNotificationType } from 'automate/notifications/types'
import {
    isLessThan24HoursAgo,
    isTrialNotificationOfType,
} from 'automate/notifications/utils'
import { account } from 'fixtures/account'
import { defaultUseAiAgentOnboardingNotificationFixture } from 'fixtures/onboardingStateNotification'
import { user } from 'fixtures/users'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { getAccountAdminsJS } from 'state/agents/selectors'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import { useNotifyAdmins } from '../hooks/useNotifyAdmins'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useCreateAiShoppingAssistantTrialRequest: jest.fn(),
}))

jest.mock('automate/notifications/utils', () => ({
    isLessThan24HoursAgo: jest.fn(),
    isTrialNotificationOfType: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => ({
    useAppSelector: jest.fn().mockImplementation((selector) => {
        if (selector === getAccountAdminsJS) {
            return mockAccountAdmins
        }
        if (selector === getCurrentUser) {
            return fromJS(user)
        }
        if (selector === getCurrentAccountId) {
            return account.id
        }
        return null
    }),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')
const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification,
)

const mockUseCreateAiShoppingAssistantTrialRequest = assumeMock(
    useCreateAiShoppingAssistantTrialRequest,
)

const mockAccountAdmins = [
    { id: 1, name: 'Admin 1', email: 'admin1@example.com' },
    { id: 2, name: 'Admin 2', email: 'admin2@example.com' },
]
const mockHandleOnTriggerTrialRequestNotification = jest.fn()
const mockHandleOnTriggerAiAgentTrialRequestNotification = jest.fn()
const mockCreateAiShoppingAssistantTrialRequest = jest.fn()
const mockOnSuccess = jest.fn()

const mockIsLessThan24HoursAgo = assumeMock(isLessThan24HoursAgo)
const mockIsTrialNotificationOfType = assumeMock(isTrialNotificationOfType)

const SHOP_NAME = 'test-shop'
const ADDITIONAL_NOTE = 'Please review this request'

const defaultUseAiAgentOnboardingNotification = {
    ...defaultUseAiAgentOnboardingNotificationFixture(),
    handleOnTriggerTrialRequestNotification:
        mockHandleOnTriggerTrialRequestNotification,
    handleOnTriggerAiAgentTrialRequestNotification:
        mockHandleOnTriggerAiAgentTrialRequestNotification,
}

describe('useNotifyAdmins', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        mockUseCreateAiShoppingAssistantTrialRequest.mockReturnValue({
            mutate: mockCreateAiShoppingAssistantTrialRequest,
        } as any)
        mockIsLessThan24HoursAgo.mockReturnValue(false)

        // Mock isTrialNotificationOfType to return true for matching trial types
        mockIsTrialNotificationOfType.mockImplementation(
            (request, trialType) =>
                request.trialType === trialType ||
                (!request.trialType &&
                    trialType === TrialType.ShoppingAssistant),
        )
    })

    describe('Shopping Assistant trial type', () => {
        it('should return initial state correctly', () => {
            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.ShoppingAssistant),
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isDisabled).toBe(false)
            expect(result.current.accountAdmins).toEqual(mockAccountAdmins)
            expect(typeof result.current.handleNotifyAdmins).toBe('function')
        })

        it('should disable notifications if user has already requested within 24 hours', () => {
            mockUseAiAgentOnboardingNotification.mockReturnValue({
                ...defaultUseAiAgentOnboardingNotification,
                onboardingNotificationState: {
                    ...defaultUseAiAgentOnboardingNotification.onboardingNotificationState,
                    trialRequestNotification: [
                        {
                            userId: user.id,
                            receivedDatetime: '2025-01-01T00:00:00Z',
                            trialType: TrialType.ShoppingAssistant,
                        },
                    ],
                },
            })
            mockIsLessThan24HoursAgo.mockReturnValue(true)

            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.ShoppingAssistant),
            )
            expect(result.current.isDisabled).toBe(true)
        })

        it('should enable notifications if user has not requested within 24 hours', () => {
            mockUseAiAgentOnboardingNotification.mockReturnValue({
                ...defaultUseAiAgentOnboardingNotification,
                onboardingNotificationState: {
                    ...defaultUseAiAgentOnboardingNotification.onboardingNotificationState,
                    trialRequestNotification: [
                        {
                            userId: user.id,
                            receivedDatetime: '2025-01-01T00:00:00Z',
                            trialType: TrialType.ShoppingAssistant,
                        },
                    ],
                },
            })
            mockIsLessThan24HoursAgo.mockReturnValue(false)

            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.ShoppingAssistant),
            )

            expect(result.current.isDisabled).toBe(false)
        })

        it('notifies admins when handleNotifyAdmins is called', async () => {
            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.ShoppingAssistant),
            )

            act(() => {
                result.current.handleNotifyAdmins()
            })

            expect(
                mockHandleOnTriggerTrialRequestNotification,
            ).toHaveBeenCalledTimes(1)
            expect(
                mockCreateAiShoppingAssistantTrialRequest,
            ).toHaveBeenCalledWith({
                data: {
                    account_id: account.id,
                    current_user_id: user.id,
                    shop_name: SHOP_NAME,
                    additional_note: undefined,
                },
            })
            expect(
                await screen.findByRole('status', {
                    name: 'Your request to access the Shopping Assistant trial has been sent to all Gorgias admins.',
                }),
            ).toBeInTheDocument()
        })

        it('notifies admins with additional note when handleNotifyAdmins is called', async () => {
            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.ShoppingAssistant),
            )

            act(() => {
                result.current.handleNotifyAdmins(ADDITIONAL_NOTE)
            })

            expect(
                mockHandleOnTriggerTrialRequestNotification,
            ).toHaveBeenCalledTimes(1)
            expect(
                mockCreateAiShoppingAssistantTrialRequest,
            ).toHaveBeenCalledWith({
                data: {
                    account_id: account.id,
                    current_user_id: user.id,
                    shop_name: SHOP_NAME,
                    additional_note: ADDITIONAL_NOTE,
                },
            })
            expect(
                await screen.findByRole('status', {
                    name: 'Your request to access the Shopping Assistant trial has been sent to all Gorgias admins.',
                }),
            ).toBeInTheDocument()
        })

        it('should call onSuccess callback when provided', () => {
            const { result } = renderHook(() =>
                useNotifyAdmins(
                    SHOP_NAME,
                    TrialType.ShoppingAssistant,
                    mockOnSuccess,
                ),
            )

            act(() => {
                result.current.handleNotifyAdmins()
            })

            expect(mockOnSuccess).toHaveBeenCalledTimes(1)
        })
    })

    describe('AI Agent trial type', () => {
        it('should return initial state correctly', () => {
            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.AiAgent),
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isDisabled).toBe(false)
            expect(result.current.accountAdmins).toEqual(mockAccountAdmins)
            expect(typeof result.current.handleNotifyAdmins).toBe('function')
        })

        it('should disable notifications if user has already requested AI Agent within 24 hours', () => {
            mockUseAiAgentOnboardingNotification.mockReturnValue({
                ...defaultUseAiAgentOnboardingNotification,
                onboardingNotificationState: {
                    ...defaultUseAiAgentOnboardingNotification.onboardingNotificationState,
                    trialRequestNotification: [
                        {
                            userId: user.id,
                            receivedDatetime: '2025-01-01T00:00:00Z',
                            trialType: TrialType.AiAgent,
                        },
                    ],
                },
            })
            mockIsLessThan24HoursAgo.mockReturnValue(true)

            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.AiAgent),
            )
            expect(result.current.isDisabled).toBe(true)
        })

        it('should enable notifications if user has not requested AI Agent within 24 hours', () => {
            mockUseAiAgentOnboardingNotification.mockReturnValue({
                ...defaultUseAiAgentOnboardingNotification,
                onboardingNotificationState: {
                    ...defaultUseAiAgentOnboardingNotification.onboardingNotificationState,
                    trialRequestNotification: [
                        {
                            userId: user.id,
                            receivedDatetime: '2025-01-01T00:00:00Z',
                            trialType: TrialType.AiAgent,
                        },
                    ],
                },
            })
            mockIsLessThan24HoursAgo.mockReturnValue(false)

            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.AiAgent),
            )

            expect(result.current.isDisabled).toBe(false)
        })

        it('notifies admins when handleNotifyAdmins is called for AI Agent', async () => {
            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.AiAgent),
            )

            act(() => {
                result.current.handleNotifyAdmins()
            })

            expect(
                mockHandleOnTriggerTrialRequestNotification,
            ).toHaveBeenCalledWith(AiAgentNotificationType.AiAgentTrialRequest)
            expect(
                mockCreateAiShoppingAssistantTrialRequest,
            ).not.toHaveBeenCalled()
            expect(
                await screen.findByRole('status', {
                    name: 'Your request to access the AI Agent trial has been sent to all Gorgias admins.',
                }),
            ).toBeInTheDocument()
        })

        it('should call onSuccess callback when provided for AI Agent', () => {
            const { result } = renderHook(() =>
                useNotifyAdmins(SHOP_NAME, TrialType.AiAgent, mockOnSuccess),
            )

            act(() => {
                result.current.handleNotifyAdmins()
            })

            expect(mockOnSuccess).toHaveBeenCalledTimes(1)
        })
    })
})
