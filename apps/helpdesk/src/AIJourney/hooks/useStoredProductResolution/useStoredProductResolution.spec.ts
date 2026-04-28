import { renderHook } from '@repo/testing'

import { useLastSelectedProduct } from 'AIJourney/hooks/useLastSelectedProduct/useLastSelectedProduct'
import type { Product } from 'constants/integrations/types/shopify'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'

import { useStoredProductResolution } from './useStoredProductResolution'

jest.mock(
    'AIJourney/hooks/useLastSelectedProduct/useLastSelectedProduct',
    () => ({
        useLastSelectedProduct: jest.fn(() => ({
            lastSelectedProductId: null,
            setLastSelectedProductId: jest.fn(),
        })),
    }),
)

jest.mock('models/integration/queries', () => ({
    ...jest.requireActual('models/integration/queries'),
    useGetProductsByIdsFromIntegration: jest.fn(() => ({
        data: undefined,
    })),
}))

const mockUseLastSelectedProduct = useLastSelectedProduct as jest.Mock
const mockUseGetProductsByIdsFromIntegration =
    useGetProductsByIdsFromIntegration as jest.Mock

const mockProducts = [
    { id: 1, title: 'Product 1' },
    { id: 42, title: 'Stored Product' },
    { id: 3, title: 'Product 3' },
] as Product[]

const defaultParams = {
    integrationId: 123,
    productList: mockProducts,
    isLoadingProducts: false,
    selectedProduct: null,
    onProductResolved: jest.fn(),
}

describe('useStoredProductResolution', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseLastSelectedProduct.mockReturnValue({
            lastSelectedProductId: null,
            setLastSelectedProductId: jest.fn(),
        })
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: undefined,
        })
    })

    it('should return setLastSelectedProductId', () => {
        const { result } = renderHook(() =>
            useStoredProductResolution(defaultParams),
        )

        expect(result.current.setLastSelectedProductId).toEqual(
            expect.any(Function),
        )
    })

    it('should restore stored product from default product list', () => {
        const onProductResolved = jest.fn()
        mockUseLastSelectedProduct.mockReturnValue({
            lastSelectedProductId: 42,
            setLastSelectedProductId: jest.fn(),
        })

        renderHook(() =>
            useStoredProductResolution({
                ...defaultParams,
                onProductResolved,
            }),
        )

        expect(onProductResolved).toHaveBeenCalledWith(mockProducts[1])
    })

    it('should fetch stored product by ID when not in default list', () => {
        const onProductResolved = jest.fn()
        mockUseLastSelectedProduct.mockReturnValue({
            lastSelectedProductId: 99,
            setLastSelectedProductId: jest.fn(),
        })
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [{ id: 99, title: 'Fetched Product' }],
        })

        renderHook(() =>
            useStoredProductResolution({
                ...defaultParams,
                onProductResolved,
            }),
        )

        expect(onProductResolved).toHaveBeenCalledWith({
            id: 99,
            title: 'Fetched Product',
        })
    })

    it('should fall back to first product when stored product not found', () => {
        const onProductResolved = jest.fn()
        mockUseLastSelectedProduct.mockReturnValue({
            lastSelectedProductId: 999,
            setLastSelectedProductId: jest.fn(),
        })

        renderHook(() =>
            useStoredProductResolution({
                ...defaultParams,
                onProductResolved,
            }),
        )

        expect(onProductResolved).toHaveBeenCalledWith(mockProducts[0])
    })

    it('should select first product when no stored preference exists', () => {
        const onProductResolved = jest.fn()

        renderHook(() =>
            useStoredProductResolution({
                ...defaultParams,
                onProductResolved,
            }),
        )

        expect(onProductResolved).toHaveBeenCalledWith(mockProducts[0])
    })

    it('should not resolve when product list is empty and no stored product', () => {
        const onProductResolved = jest.fn()

        renderHook(() =>
            useStoredProductResolution({
                ...defaultParams,
                productList: [] as Product[],
                onProductResolved,
            }),
        )

        expect(onProductResolved).not.toHaveBeenCalled()
    })

    it('should not resolve product while loading', () => {
        const onProductResolved = jest.fn()

        renderHook(() =>
            useStoredProductResolution({
                ...defaultParams,
                isLoadingProducts: true,
                productList: [] as Product[],
                onProductResolved,
            }),
        )

        expect(onProductResolved).not.toHaveBeenCalled()
    })

    it('should not resolve product when one is already selected', () => {
        const onProductResolved = jest.fn()

        renderHook(() =>
            useStoredProductResolution({
                ...defaultParams,
                selectedProduct: mockProducts[0] as any,
                onProductResolved,
            }),
        )

        expect(onProductResolved).not.toHaveBeenCalled()
    })

    it('should not fetch stored product when integration is missing', () => {
        mockUseLastSelectedProduct.mockReturnValue({
            lastSelectedProductId: 99,
            setLastSelectedProductId: jest.fn(),
        })

        renderHook(() =>
            useStoredProductResolution({
                ...defaultParams,
                integrationId: undefined,
            }),
        )

        expect(mockUseGetProductsByIdsFromIntegration).toHaveBeenCalledWith(
            0,
            [99],
            false,
        )
    })
})
