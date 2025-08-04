import { assumeMock } from '@repo/testing'
import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useCreateAiShoppingAssistantTrialRequest } from '@gorgias/helpdesk-queries'

import { isLessThan24HoursAgo } from 'automate/notifications/utils'
import { account } from 'fixtures/account'
import { defaultUseAiAgentOnboardingNotificationFixture } from 'fixtures/onboardingStateNotification'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { getAccountAdminsJS } from 'state/agents/selectors'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useNotifyAdmins } from '../hooks/useNotifyAdmins'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useCreateAiShoppingAssistantTrialRequest: jest.fn(),
}))

jest.mock('automate/notifications/utils', () => ({
    isLessThan24HoursAgo: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())
const mockUseAppDispatch = assumeMock(useAppDispatch)

jest.mock('hooks/useAppSelector', () =>
    jest.fn().mockImplementation((selector) => {
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
)

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')
const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification,
)

jest.mock('state/notifications/actions')
const mockNotify = assumeMock(notify)

const mockUseCreateAiShoppingAssistantTrialRequest = assumeMock(
    useCreateAiShoppingAssistantTrialRequest,
)

const mockAccountAdmins = [
    { id: 1, name: 'Admin 1', email: 'admin1@example.com' },
    { id: 2, name: 'Admin 2', email: 'admin2@example.com' },
]

const mockDispatch = jest.fn()
const mockHandleOnTriggerTrialRequestNotification = jest.fn()
const mockCreateAiShoppingAssistantTrialRequest = jest.fn()

const mockIsLessThan24HoursAgo = assumeMock(isLessThan24HoursAgo)

const SHOP_NAME = 'test-shop'
const ADDITIONAL_NOTE = 'Please review this request'

const defaultUseAiAgentOnboardingNotification = {
    ...defaultUseAiAgentOnboardingNotificationFixture(),
    handleOnTriggerTrialRequestNotification:
        mockHandleOnTriggerTrialRequestNotification,
}

describe('useNotifyAdmins', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )
        mockUseCreateAiShoppingAssistantTrialRequest.mockReturnValue({
            mutate: mockCreateAiShoppingAssistantTrialRequest,
        } as any)
        mockIsLessThan24HoursAgo.mockReturnValue(false)
    })

    it('should return initial state correctly', () => {
        const { result } = renderHook(() => useNotifyAdmins(SHOP_NAME))

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isOpen).toBe(false)
        expect(result.current.isDisabled).toBe(false)
        expect(result.current.modalContent).toEqual({
            title: 'Request your admin to activate Shopping Assistant trial',
            subtitle:
                'Your Gorgias admins will be notified of your request via both email and an in-app notification.',
            primaryCTALabel: 'Notify Admins',
            accountAdmins: mockAccountAdmins,
            onPrimaryAction: expect.any(Function),
            onClose: expect.any(Function),
        })
    })

    it('should return initial state correctly with additional note', () => {
        const { result } = renderHook(() =>
            useNotifyAdmins(SHOP_NAME, ADDITIONAL_NOTE),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isOpen).toBe(false)
        expect(result.current.isDisabled).toBe(false)
        expect(result.current.modalContent).toEqual({
            title: 'Request your admin to activate Shopping Assistant trial',
            subtitle:
                'Your Gorgias admins will be notified of your request via both email and an in-app notification.',
            primaryCTALabel: 'Notify Admins',
            accountAdmins: mockAccountAdmins,
            onPrimaryAction: expect.any(Function),
            onClose: expect.any(Function),
        })
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
                    },
                ],
            },
        })
        mockIsLessThan24HoursAgo.mockReturnValue(true)

        const { result } = renderHook(() => useNotifyAdmins(SHOP_NAME))
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
                    },
                ],
            },
        })
        mockIsLessThan24HoursAgo.mockReturnValue(false)

        const { result } = renderHook(() => useNotifyAdmins(SHOP_NAME))

        expect(result.current.isDisabled).toBe(false)
    })

    it('should handle modal open and close', () => {
        const { result } = renderHook(() => useNotifyAdmins(SHOP_NAME))

        act(() => {
            result.current.handleModalOpen()
        })
        expect(result.current.isOpen).toBe(true)

        act(() => {
            result.current.handleModalClose()
        })
        expect(result.current.isOpen).toBe(false)
    })

    it('should notify admins when handleNotifyAdmins is called', () => {
        mockNotify.mockReturnValue(mockDispatch)

        const { result } = renderHook(() => useNotifyAdmins(SHOP_NAME))

        act(() => {
            result.current.modalContent.onPrimaryAction()
        })

        expect(
            mockHandleOnTriggerTrialRequestNotification,
        ).toHaveBeenCalledTimes(1)
        expect(mockCreateAiShoppingAssistantTrialRequest).toHaveBeenCalledWith({
            data: {
                account_id: account.id,
                current_user_id: user.id,
                shop_name: SHOP_NAME,
                additional_note: undefined,
            },
        })
        expect(mockNotify).toHaveBeenCalledWith({
            message:
                'Your request to Shopping Assistant trial has been sent to all Gorgias admins.',
            status: NotificationStatus.Success,
        })
        expect(mockDispatch).toHaveBeenCalled()
        expect(result.current.isOpen).toBe(false)
    })

    it('should notify admins with additional note when handleNotifyAdmins is called', () => {
        mockNotify.mockReturnValue(mockDispatch)

        const { result } = renderHook(() =>
            useNotifyAdmins(SHOP_NAME, ADDITIONAL_NOTE),
        )

        act(() => {
            result.current.modalContent.onPrimaryAction()
        })

        expect(
            mockHandleOnTriggerTrialRequestNotification,
        ).toHaveBeenCalledTimes(1)
        expect(mockCreateAiShoppingAssistantTrialRequest).toHaveBeenCalledWith({
            data: {
                account_id: account.id,
                current_user_id: user.id,
                shop_name: SHOP_NAME,
                additional_note: ADDITIONAL_NOTE,
            },
        })
        expect(mockNotify).toHaveBeenCalledWith({
            message:
                'Your request to Shopping Assistant trial has been sent to all Gorgias admins.',
            status: NotificationStatus.Success,
        })
        expect(mockDispatch).toHaveBeenCalled()
        expect(result.current.isOpen).toBe(false)
    })
})
