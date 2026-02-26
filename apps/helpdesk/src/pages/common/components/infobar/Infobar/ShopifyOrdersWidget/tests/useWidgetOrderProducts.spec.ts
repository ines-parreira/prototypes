import { renderHook } from '@testing-library/react'

import { useWidgetOrderProducts } from '../useWidgetOrderProducts'

const mockUseProductsMap = jest.fn().mockReturnValue({ productsMap: new Map() })

jest.mock('@repo/ecommerce/shopify/hooks', () => ({
    useProductsMap: (...args: unknown[]) => mockUseProductsMap(...args),
}))

function createOrder(
    lineItems: Array<{ product_id?: number | null; product_exists?: boolean }>,
) {
    return { line_items: lineItems } as any
}

beforeEach(() => {
    mockUseProductsMap.mockClear()
})

describe('useWidgetOrderProducts', () => {
    it.each([
        ['order is null', { integrationId: 1, order: null }],
        [
            'integrationId is undefined',
            { integrationId: undefined, order: createOrder([]) },
        ],
    ])('should pass empty productExternalIds when %s', (_, params) => {
        renderHook(() => useWidgetOrderProducts(params))

        expect(mockUseProductsMap).toHaveBeenCalledWith(
            expect.objectContaining({ productExternalIds: [] }),
        )
    })

    it('should extract unique product ids, skipping missing or non-existent products', () => {
        const order = createOrder([
            { product_id: 100, product_exists: true },
            { product_id: 100, product_exists: true },
            { product_id: 200 },
            { product_id: null },
            { product_id: 300, product_exists: false },
        ])

        renderHook(() => useWidgetOrderProducts({ integrationId: 1, order }))

        expect(mockUseProductsMap).toHaveBeenCalledWith({
            integrationId: 1,
            productExternalIds: ['100', '200'],
        })
    })
})
