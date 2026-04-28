import { renderHook } from '@repo/testing'

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
        ['orders is empty', { integrationId: 1, orders: [] }],
        [
            'integrationId is undefined',
            { integrationId: undefined, orders: [createOrder([])] },
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

        renderHook(() =>
            useWidgetOrderProducts({ integrationId: 1, orders: [order] }),
        )

        expect(mockUseProductsMap).toHaveBeenCalledWith({
            integrationId: 1,
            productExternalIds: ['100', '200'],
        })
    })

    it('should collect product ids across multiple orders', () => {
        const order1 = createOrder([
            { product_id: 100, product_exists: true },
            { product_id: 200, product_exists: true },
        ])
        const order2 = createOrder([
            { product_id: 200, product_exists: true },
            { product_id: 300, product_exists: true },
        ])

        renderHook(() =>
            useWidgetOrderProducts({
                integrationId: 1,
                orders: [order1, order2],
            }),
        )

        expect(mockUseProductsMap).toHaveBeenCalledWith({
            integrationId: 1,
            productExternalIds: ['100', '200', '300'],
        })
    })
})
