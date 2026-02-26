import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { useHistory, useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useCheckStoreIntegration } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppSelector')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseParams = useParams as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock
const notifyActionMock = assumeMock(notifyAction)
const useAppDispatchMock = assumeMock(useAppDispatch)
const mockDispatch = jest.fn()

describe('useCheckStoreIntegration', () => {
    let mockHistoryPush: jest.Mock

    beforeEach(() => {
        mockHistoryPush = jest.fn()
        mockUseHistory.mockReturnValue({ push: mockHistoryPush })
        useAppDispatchMock.mockReturnValue(mockDispatch)
        notifyActionMock.mockReturnValue(mockDispatch)
    })

    it('should not redirect when isLoading is true', () => {
        mockUseParams.mockReturnValue({ shopName: 'test-store' })
        mockUseAppSelector.mockReturnValue(
            fromJS({ id: '123', name: 'Valid Store' }),
        )
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true,
        })

        const { result } = renderHook(() => useCheckStoreIntegration())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should not redirect when shouldCheck is false', () => {
        mockUseParams.mockReturnValue({ shopName: 'test-store' })
        mockUseAppSelector.mockReturnValue(
            fromJS({ id: '123', name: 'Valid Store' }),
        )
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true,
        })

        const { result } = renderHook(() => useCheckStoreIntegration(false))

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
            isLoading: false,
        })

        const { result } = renderHook(() => useCheckStoreIntegration())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should redirect to Shopify integration step when storeIntegration is empty', () => {
        mockUseParams.mockReturnValue({ shopName: 'empty-store' })
        mockUseAppSelector.mockReturnValue(fromJS({}))
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: false,
        })

        renderHook(() => useCheckStoreIntegration())

        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(notifyActionMock).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message:
                'There are no existing store integrations. Redirecting to the shopify integration step.',
            id: 'store-integration-empty-error',
        })
        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/ai-agent/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`,
        )
    })
})
