import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { useHistory, useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'

jest.mock('hooks/useAppSelector')
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseParams = useParams as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

describe('useCheckStoreIntegration', () => {
    let mockHistoryPush: jest.Mock

    beforeEach(() => {
        mockHistoryPush = jest.fn()
        mockUseHistory.mockReturnValue({ push: mockHistoryPush })
    })

    it('should not redirect when isLoading is true', () => {
        mockUseParams.mockReturnValue({ shopName: 'test-store' })
        mockUseAppSelector.mockReturnValue(
            fromJS({ id: '123', name: 'Valid Store' }),
        )
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true, // Simulate loading state
        })

        const { result } = renderHook(() => useCheckStoreIntegration())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should not redirect when storeIntegration is valid', () => {
        mockUseParams.mockReturnValue({ shopName: 'valid-store' })
        mockUseAppSelector.mockReturnValue(
            fromJS({ id: '123', name: 'Valid Store' }),
        )
        mockUseGetOnboardingData.mockReturnValue({
            data: { id: '123', shopName: 'valid-store' },
            isLoading: false, // Data loaded
        })

        const { result } = renderHook(() => useCheckStoreIntegration())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should redirect to Shopify integration step when storeIntegration is empty', () => {
        mockUseParams.mockReturnValue({ shopName: 'empty-store' })
        mockUseAppSelector.mockReturnValue(fromJS({})) // Simulate empty store integration
        mockUseGetOnboardingData.mockReturnValue({
            data: null, // Simulate no onboarding data
            isLoading: false,
        })

        renderHook(() => useCheckStoreIntegration())

        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/ai-agent/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`,
        )
    })
})
