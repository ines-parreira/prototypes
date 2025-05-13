import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { renderHook } from 'utils/testing/renderHook'

// Mock the useGetStoresConfigurationForAccount hook
jest.mock('models/aiAgent/queries', () => ({
    useGetStoresConfigurationForAccount: jest.fn(),
}))

describe('useStoreConfigurationForAccount', () => {
    const mockStoreConfigurations = {
        data: {
            storeConfigurations: [
                { storeName: 'store1', storeId: '1' },
                { storeName: 'store2', storeId: '2' },
                { storeName: 'store3', storeId: '3' },
            ],
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return loading state and all store configurations when no storeNames provided', () => {
        // Mock implementation
        ;(useGetStoresConfigurationForAccount as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockStoreConfigurations,
        })

        const { result } = renderHook(() =>
            useStoreConfigurationForAccount({
                accountDomain: 'test.domain.com',
            }),
        )

        expect(useGetStoresConfigurationForAccount).toHaveBeenCalledWith(
            { accountDomain: 'test.domain.com' },
            { retry: 1, refetchOnWindowFocus: false, enabled: true },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.storeConfigurations).toEqual(
            mockStoreConfigurations.data.storeConfigurations,
        )
    })

    it('should filter store configurations based on provided storeNames', () => {
        // Mock implementation
        ;(useGetStoresConfigurationForAccount as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockStoreConfigurations,
        })

        const { result } = renderHook(() =>
            useStoreConfigurationForAccount({
                accountDomain: 'test.domain.com',
                storesName: ['store1', 'store3'],
            }),
        )

        expect(result.current.storeConfigurations).toEqual([
            { storeName: 'store1', storeId: '1' },
            { storeName: 'store3', storeId: '3' },
        ])
    })

    it('should handle loading state correctly', () => {
        // Mock loading state
        ;(useGetStoresConfigurationForAccount as jest.Mock).mockReturnValue({
            isLoading: true,
            data: undefined,
        })

        const { result } = renderHook(() =>
            useStoreConfigurationForAccount({
                accountDomain: 'test.domain.com',
            }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.storeConfigurations).toBeUndefined()
    })

    it('should respect the enabled parameter', () => {
        // Mock implementation
        ;(useGetStoresConfigurationForAccount as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockStoreConfigurations,
        })

        renderHook(() =>
            useStoreConfigurationForAccount({
                accountDomain: 'test.domain.com',
                enabled: false,
            }),
        )

        expect(useGetStoresConfigurationForAccount).toHaveBeenCalledWith(
            { accountDomain: 'test.domain.com' },
            { retry: 1, refetchOnWindowFocus: false, enabled: false },
        )
    })

    it('should handle undefined data gracefully', () => {
        // Mock implementation with undefined data
        ;(useGetStoresConfigurationForAccount as jest.Mock).mockReturnValue({
            isLoading: false,
            data: undefined,
        })

        const { result } = renderHook(() =>
            useStoreConfigurationForAccount({
                accountDomain: 'test.domain.com',
            }),
        )

        expect(result.current.storeConfigurations).toBeUndefined()
    })
})
