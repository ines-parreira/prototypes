import { assumeMock, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { useHistory, useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useFetchAiAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData'

import { useCheckStoreAlreadyConfigured } from '../useCheckStoreAlreadyConfigured'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))
jest.mock('hooks/useAppSelector')
jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData',
)

const mockUseParams = useParams as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseFetchAiAgentStoreConfigurationData = assumeMock(
    useFetchAiAgentStoreConfigurationData,
)

const mockData = getStoreConfigurationFixture({ storeName: 'configured-store' })

describe('useCheckStoreAlreadyConfigured', () => {
    let mockHistoryPush: jest.Mock

    beforeEach(() => {
        mockHistoryPush = jest.fn()
        mockUseHistory.mockReturnValue({ push: mockHistoryPush })
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
        expect(
            screen.queryByRole('status', { hidden: true }),
        ).not.toBeInTheDocument()
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
        expect(
            screen.queryByRole('status', { hidden: true }),
        ).not.toBeInTheDocument()
        expect(result.current).toBeNull()
    })

    it('should redirect to settings when storeConfig exists and notify user', async () => {
        mockUseParams.mockReturnValue({
            shopName: 'configured-store',
            shopType: 'shopify',
        })
        mockUseFetchAiAgentStoreConfigurationData.mockReturnValue({
            data: undefined,
            isLoading: true,
            isFetched: false,
            error: false,
        })

        const { rerender } = renderHook(() => useCheckStoreAlreadyConfigured())

        mockUseFetchAiAgentStoreConfigurationData.mockReturnValue({
            data: mockData,
            isLoading: false,
            isFetched: true,
            error: false,
        })

        rerender()

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'An Existing Store configuration is already set up. Redirecting to the AI agent settings.',
                    hidden: true,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/configured-store/settings`,
        )
    })
})
