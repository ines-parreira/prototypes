import { renderHook } from '@repo/testing'

import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useGetShoppingAssistantEnabled } from 'pages/aiAgent/hooks/useGetShoppingAssistantEnabled'

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')

describe('useGetShoppingAssistantEnabled', () => {
    const mockShopName = 'test-shop'
    const mockUseStoreActivations = useStoreActivations as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return isEnabled as false when data is not loaded', () => {
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {},
            isFetchLoading: true,
        })

        const { result } = renderHook(() =>
            useGetShoppingAssistantEnabled({ shopName: mockShopName }),
        )

        expect(result.current.isEnabled).toBe(false)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return isEnabled as false when data is loaded but not enabled', () => {
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {
                [mockShopName]: {
                    sales: {
                        enabled: false,
                    },
                },
            },
            isFetchLoading: false,
        })

        const { result } = renderHook(() =>
            useGetShoppingAssistantEnabled({ shopName: mockShopName }),
        )

        expect(result.current.isEnabled).toBe(false)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return isEnabled as true when data is loaded and enabled', () => {
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {
                [mockShopName]: {
                    sales: {
                        enabled: true,
                    },
                },
            },
            isFetchLoading: false,
        })

        const { result } = renderHook(() =>
            useGetShoppingAssistantEnabled({ shopName: mockShopName }),
        )

        expect(result.current.isEnabled).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return isEnabled as false when data is loaded but sales is undefined', () => {
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {
                [mockShopName]: {},
            },
            isFetchLoading: false,
        })

        const { result } = renderHook(() =>
            useGetShoppingAssistantEnabled({ shopName: mockShopName }),
        )

        expect(result.current.isEnabled).toBe(false)
        expect(result.current.isLoading).toBe(false)
    })
})
