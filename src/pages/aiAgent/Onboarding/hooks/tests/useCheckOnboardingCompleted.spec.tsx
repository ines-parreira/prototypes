import { renderHook } from '@testing-library/react-hooks'
import { useHistory, useParams } from 'react-router-dom'

import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')

const mockUseParams = useParams as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

describe('useCheckOnboardingCompleted', () => {
    let mockHistoryPush: jest.Mock

    beforeEach(() => {
        mockHistoryPush = jest.fn()
        mockUseHistory.mockReturnValue({ push: mockHistoryPush })
    })

    it('should not redirect when isLoading is true', () => {
        mockUseParams.mockReturnValue({ shopName: 'test-store' })
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true, // Simulating loading state
        })

        const { result } = renderHook(() => useCheckOnboardingCompleted())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should not redirect when onboarding is not completed', () => {
        mockUseParams.mockReturnValue({ shopName: 'incomplete-store' })
        mockUseGetOnboardingData.mockReturnValue({
            data: { completedDatetime: null }, // No completion date means onboarding isn't done
            isLoading: false,
        })

        const { result } = renderHook(() => useCheckOnboardingCompleted())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should redirect to the SKILLSET step when onboarding is completed', () => {
        mockUseParams.mockReturnValue({ shopName: 'completed-store' })
        mockUseGetOnboardingData.mockReturnValue({
            data: { completedDatetime: '2024-02-21T12:00:00Z' }, // Simulating completion
            isLoading: false,
        })

        renderHook(() => useCheckOnboardingCompleted())

        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/ai-agent/onboarding/undefined/completed-store`,
        )
    })
})
