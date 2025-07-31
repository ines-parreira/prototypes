import { renderHook } from '@repo/testing'
import { useHistory, useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useFetchAiAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData'
import { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { useCheckStoreAlreadyConfigured } from '../useCheckStoreAlreadyConfigured'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('state/notifications/actions')
jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData',
)

const mockUseParams = useParams as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseFetchAiAgentStoreConfigurationData = assumeMock(
    useFetchAiAgentStoreConfigurationData,
)
const notifyActionMock = assumeMock(notifyAction)
const mockDispatch = jest.fn()

const mockData = getStoreConfigurationFixture({ storeName: 'configured-store' })

describe('useCheckStoreAlreadyConfigured', () => {
    let mockHistoryPush: jest.Mock

    beforeEach(() => {
        mockHistoryPush = jest.fn()
        mockUseHistory.mockReturnValue({ push: mockHistoryPush })
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        notifyActionMock.mockReturnValue(mockDispatch)
        mockUseAppSelector.mockReturnValue('test-account') // Mocking accountDomain
    })

    it('should not redirect when isFetchingStoreConfiguration is true', () => {
        mockUseParams.mockReturnValue({ shopName: 'test-store' })
        mockUseFetchAiAgentStoreConfigurationData.mockReturnValue({
            data: undefined,
            isLoading: true,
            isFetched: false,
            error: false,
        })

        const { result } = renderHook(() => useCheckStoreAlreadyConfigured())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should not redirect when storeConfig is not set', () => {
        mockUseParams.mockReturnValue({ shopName: 'incomplete-store' })
        mockUseFetchAiAgentStoreConfigurationData.mockReturnValue({
            data: undefined,
            isLoading: false,
            isFetched: true,
            error: false,
        })

        const { result } = renderHook(() => useCheckStoreAlreadyConfigured())

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(result.current).toBeNull()
    })

    it('should redirect to settings when storeConfig exists and notify user', () => {
        mockUseParams.mockReturnValue({
            shopName: 'configured-store',
            shopType: 'shopify',
        })
        mockUseFetchAiAgentStoreConfigurationData.mockReturnValue({
            data: mockData,
            isLoading: false,
            isFetched: true,
            error: false,
        })

        renderHook(() => useCheckStoreAlreadyConfigured())

        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(notifyActionMock).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message:
                'An Existing Store configuration is already set up. Redirecting to the AI agent settings.',
            id: 'store-already-configured-error',
        })
        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/configured-store/settings`,
        )
    })
})
