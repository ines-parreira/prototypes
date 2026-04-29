import { renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { useHistory, useParams } from 'react-router-dom'

import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')

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
        expect(
            screen.queryByRole('status', { hidden: true }),
        ).not.toBeInTheDocument()
        expect(result.current).toBeNull()
    })

    it('should redirect to the SKILLSET step when onboarding is completed', async () => {
        mockUseParams.mockReturnValue({ shopName: 'completed-store' })
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true,
        })

        const { rerender } = renderHook(() => useCheckOnboardingCompleted())

        mockUseGetOnboardingData.mockReturnValue({
            data: {
                completedDatetime: '2024-02-21T12:00:00Z',
                shopType: 'shopify',
            },
            isLoading: false,
        })

        rerender()

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'This store has already completed its onboarding. Redirecting to the AI agent settings.',
                    hidden: true,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/completed-store/settings`,
        )
    })
})
