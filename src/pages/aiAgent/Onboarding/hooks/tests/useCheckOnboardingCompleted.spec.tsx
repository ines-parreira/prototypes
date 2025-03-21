import { renderHook } from '@testing-library/react-hooks'
import { useHistory, useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const mockUseParams = useParams as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock
const notifyActionMock = assumeMock(notifyAction)
const useAppDispatchMock = assumeMock(useAppDispatch)
const mockDispatch = jest.fn()

describe('useCheckOnboardingCompleted', () => {
    let mockHistoryPush: jest.Mock

    beforeEach(() => {
        mockHistoryPush = jest.fn()
        mockUseHistory.mockReturnValue({ push: mockHistoryPush })
        useAppDispatchMock.mockReturnValue(mockDispatch)
        notifyActionMock.mockReturnValue(mockDispatch)
    })

    it('should not redirect when isLoading is true', () => {
        mockUseParams.mockReturnValue({ shopName: 'test-store' })
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true,
        })

        const { result } = renderHook(() => useCheckOnboardingCompleted())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should not redirect when onboarding is not completed', () => {
        mockUseParams.mockReturnValue({ shopName: 'incomplete-store' })
        mockUseGetOnboardingData.mockReturnValue({
            data: { completedDatetime: null },
            isLoading: false,
        })

        const { result } = renderHook(() => useCheckOnboardingCompleted())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should redirect to the SKILLSET step when onboarding is completed', () => {
        mockUseParams.mockReturnValue({ shopName: 'completed-store' })
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                completedDatetime: '2024-02-21T12:00:00Z',
                shopType: 'shopify',
            },
            isLoading: false,
        })

        renderHook(() => useCheckOnboardingCompleted())

        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(notifyActionMock).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message:
                'An Existing Store configuration is already set up. Redirecting to the AI agent settings.',
            id: 'onboarding-already-completed',
        })
        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/completed-store/settings`,
        )
    })
})
