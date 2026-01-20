import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import type { Order, Product } from 'constants/integrations/types/shopify'
import type { Customer } from 'models/customer/types'
import { IntegrationType } from 'models/integration/constants'

import { useOrderProducts } from '../hooks/useOrderProducts'

jest.mock('state/integrations/helpers', () => ({
    fetchIntegrationProducts: jest.fn(),
}))

const { fetchIntegrationProducts } = jest.requireMock(
    'state/integrations/helpers',
)

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const createMockCustomer = (
    shopifyIntegrationId: number | null = 123,
): Customer => ({
    id: 1,
    email: 'customer@example.com',
    name: 'Test Customer',
    firstname: 'Test',
    lastname: 'Customer',
    active: true,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    channels: [],
    note: '',
    customer: null,
    data: null,
    external_id: null,
    language: 'en',
    meta: {},
    timezone: 'UTC',
    integrations: shopifyIntegrationId
        ? {
              [shopifyIntegrationId]: {
                  __integration_type__: IntegrationType.Shopify,
                  args: {},
                  headers: {},
                  origin: 'https://test.myshopify.com',
                  url: 'https://test.myshopify.com',
                  orders: [],
              },
          }
        : {},
})

const createMockOrder = (
    id: number,
    lineItems: Array<{
        product_id: number | null
        product_exists?: boolean
    }> = [],
): Order =>
    ({
        id,
        name: `#${id}`,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        line_items: lineItems.map((item, index) => ({
            id: index + 1,
            product_id: item.product_id,
            product_exists: item.product_exists ?? true,
            variant_id: item.product_id,
            title: `Product ${item.product_id}`,
            variant_title: 'Variant',
            quantity: 1,
            price: '10.00',
        })) as any,
        currency: 'USD',
        total_price: '100.00',
        financial_status: 'paid' as any,
        fulfillment_status: null,
        note: '',
        tags: '',
        shipping_address: {} as any,
        billing_address: {} as any,
        discount_codes: [],
        shipping_lines: [],
        total_line_items_price: '100.00',
        total_discounts: '0.00',
        subtotal_price: '100.00',
        total_tax: '0.00',
        taxes_included: false,
        discount_applications: [],
        refunds: [],
    }) as Order

const createMockProduct = (id: number): Product =>
    ({
        id,
        title: `Product ${id}`,
        vendor: 'Test Vendor',
        product_type: 'Test Type',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        published_at: '2024-01-01T00:00:00Z',
        tags: '',
        variants: [],
        images: [],
        image: null,
        options: [],
    }) as Product

describe('useOrderProducts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Shopify integration extraction', () => {
        it('should extract Shopify integration IDs from customer', async () => {
            const customer = createMockCustomer(123)
            const orders: Order[] = []

            fetchIntegrationProducts.mockResolvedValue([])

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            expect(result.current.hasShopifyIntegration).toBe(true)
        })

        it('should handle customer with no integrations', () => {
            const customer = createMockCustomer(null)
            const orders: Order[] = []

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            expect(result.current.hasShopifyIntegration).toBe(false)
            expect(result.current.products.size).toBe(0)
        })

        it('should handle undefined customer', () => {
            const orders: Order[] = []

            const { result } = renderHook(
                () => useOrderProducts(undefined, orders),
                { wrapper: createWrapper() },
            )

            expect(result.current.hasShopifyIntegration).toBe(false)
            expect(result.current.products.size).toBe(0)
        })

        it('should handle customer with multiple Shopify integrations', async () => {
            const customer: Customer = {
                ...createMockCustomer(123),
                integrations: {
                    '123': {
                        __integration_type__: IntegrationType.Shopify,
                        args: {},
                        headers: {},
                        origin: 'https://store1.myshopify.com',
                        url: 'https://store1.myshopify.com',
                        orders: [],
                    },
                    '456': {
                        __integration_type__: IntegrationType.Shopify,
                        args: {},
                        headers: {},
                        origin: 'https://store2.myshopify.com',
                        url: 'https://store2.myshopify.com',
                        orders: [],
                    },
                },
            }

            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            const product = createMockProduct(100)
            fetchIntegrationProducts.mockResolvedValue([fromJS(product)])

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(fetchIntegrationProducts).toHaveBeenCalledTimes(2)
            expect(fetchIntegrationProducts).toHaveBeenCalledWith(123, [100])
            expect(fetchIntegrationProducts).toHaveBeenCalledWith(456, [100])
        })

        it('should filter out non-Shopify integrations', () => {
            const customer: Customer = {
                ...createMockCustomer(null),
                integrations: {
                    '123': {
                        __integration_type__: IntegrationType.Email,
                        args: {},
                        headers: {},
                        origin: '',
                        url: '',
                    } as any,
                    '456': {
                        __integration_type__: IntegrationType.Shopify,
                        args: {},
                        headers: {},
                        origin: 'https://test.myshopify.com',
                        url: 'https://test.myshopify.com',
                        orders: [],
                    },
                },
            }

            const orders: Order[] = []

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            expect(result.current.hasShopifyIntegration).toBe(true)
        })
    })

    describe('Product ID extraction', () => {
        it('should extract unique product IDs from orders', async () => {
            const customer = createMockCustomer(123)
            const orders = [
                createMockOrder(1, [{ product_id: 100 }, { product_id: 200 }]),
                createMockOrder(2, [{ product_id: 100 }, { product_id: 300 }]),
            ]

            const products = [100, 200, 300].map((id) =>
                fromJS(createMockProduct(id)),
            )
            fetchIntegrationProducts.mockResolvedValue(products)

            renderHook(() => useOrderProducts(customer, orders), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(fetchIntegrationProducts).toHaveBeenCalledWith(
                    123,
                    [100, 200, 300],
                )
            })
        })

        it('should only fetch products that exist in Shopify', async () => {
            const customer = createMockCustomer(123)
            const orders = [
                createMockOrder(1, [
                    { product_id: 100, product_exists: true },
                    { product_id: 200, product_exists: false },
                    { product_id: 300, product_exists: true },
                ]),
            ]

            const products = [100, 300].map((id) =>
                fromJS(createMockProduct(id)),
            )
            fetchIntegrationProducts.mockResolvedValue(products)

            renderHook(() => useOrderProducts(customer, orders), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(fetchIntegrationProducts).toHaveBeenCalledWith(
                    123,
                    [100, 300],
                )
            })
        })

        it('should handle orders with null product_id', async () => {
            const customer = createMockCustomer(123)
            const orders = [
                createMockOrder(1, [
                    { product_id: 100 },
                    { product_id: null },
                    { product_id: 200 },
                ]),
            ]

            const products = [100, 200].map((id) =>
                fromJS(createMockProduct(id)),
            )
            fetchIntegrationProducts.mockResolvedValue(products)

            renderHook(() => useOrderProducts(customer, orders), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(fetchIntegrationProducts).toHaveBeenCalledWith(
                    123,
                    [100, 200],
                )
            })
        })

        it('should handle empty orders array', () => {
            const customer = createMockCustomer(123)
            const orders: Order[] = []

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            expect(fetchIntegrationProducts).not.toHaveBeenCalled()
            expect(result.current.products.size).toBe(0)
        })

        it('should handle orders with no line items', () => {
            const customer = createMockCustomer(123)
            const orders = [createMockOrder(1, [])]

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            expect(fetchIntegrationProducts).not.toHaveBeenCalled()
            expect(result.current.products.size).toBe(0)
        })
    })

    describe('Product fetching', () => {
        it('should fetch products and create a map', async () => {
            const customer = createMockCustomer(123)
            const orders = [
                createMockOrder(1, [{ product_id: 100 }, { product_id: 200 }]),
            ]

            const products = [
                fromJS(createMockProduct(100)),
                fromJS(createMockProduct(200)),
            ]
            fetchIntegrationProducts.mockResolvedValue(products)

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.products.size).toBe(2)
            expect(result.current.products.get(100)?.title).toBe('Product 100')
            expect(result.current.products.get(200)?.title).toBe('Product 200')
        })

        it('should handle products from multiple integrations', async () => {
            const customer: Customer = {
                ...createMockCustomer(123),
                integrations: {
                    '123': {
                        __integration_type__: IntegrationType.Shopify,
                        args: {},
                        headers: {},
                        origin: 'https://store1.myshopify.com',
                        url: 'https://store1.myshopify.com',
                        orders: [],
                    },
                    '456': {
                        __integration_type__: IntegrationType.Shopify,
                        args: {},
                        headers: {},
                        origin: 'https://store2.myshopify.com',
                        url: 'https://store2.myshopify.com',
                        orders: [],
                    },
                },
            }

            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            fetchIntegrationProducts
                .mockResolvedValueOnce([fromJS(createMockProduct(100))])
                .mockResolvedValueOnce([fromJS(createMockProduct(100))])

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.products.size).toBe(1)
            expect(result.current.products.get(100)?.title).toBe('Product 100')
        })

        it('should deduplicate products by ID', async () => {
            const customer = createMockCustomer(123)
            const orders = [
                createMockOrder(1, [
                    { product_id: 100 },
                    { product_id: 100 },
                    { product_id: 200 },
                ]),
            ]

            const products = [
                fromJS(createMockProduct(100)),
                fromJS(createMockProduct(200)),
            ]
            fetchIntegrationProducts.mockResolvedValue(products)

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.products.size).toBe(2)
            expect(fetchIntegrationProducts).toHaveBeenCalledWith(
                123,
                [100, 200],
            )
        })

        it('should handle products without ID', async () => {
            const customer = createMockCustomer(123)
            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            const invalidProduct = { ...createMockProduct(100), id: undefined }
            fetchIntegrationProducts.mockResolvedValue([fromJS(invalidProduct)])

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.products.size).toBe(0)
        })

        it('should handle empty response from fetchIntegrationProducts', async () => {
            const customer = createMockCustomer(123)
            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            fetchIntegrationProducts.mockResolvedValue([])

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.products.size).toBe(0)
        })
    })

    describe('Query behavior', () => {
        it('should not fetch when no Shopify integration exists', () => {
            const customer = createMockCustomer(null)
            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            renderHook(() => useOrderProducts(customer, orders), {
                wrapper: createWrapper(),
            })

            expect(fetchIntegrationProducts).not.toHaveBeenCalled()
        })

        it('should not fetch when no product IDs exist', () => {
            const customer = createMockCustomer(123)
            const orders: Order[] = []

            renderHook(() => useOrderProducts(customer, orders), {
                wrapper: createWrapper(),
            })

            expect(fetchIntegrationProducts).not.toHaveBeenCalled()
        })

        it('should set loading state correctly', async () => {
            const customer = createMockCustomer(123)
            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            let resolveProducts: any
            const productsPromise = new Promise((resolve) => {
                resolveProducts = resolve
            })
            fetchIntegrationProducts.mockReturnValue(productsPromise)

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            expect(result.current.isLoading).toBe(true)

            resolveProducts([fromJS(createMockProduct(100))])

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })
        })

        it('should handle errors', async () => {
            const customer = createMockCustomer(123)
            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            fetchIntegrationProducts.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.isError).toBe(true)
        })

        it('should use Infinity staleTime', async () => {
            const customer = createMockCustomer(123)
            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            fetchIntegrationProducts.mockResolvedValue([
                fromJS(createMockProduct(100)),
            ])

            const { result, rerender } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            const callCount = fetchIntegrationProducts.mock.calls.length

            rerender()

            expect(fetchIntegrationProducts.mock.calls.length).toBe(callCount)
        })
    })

    describe('Return values', () => {
        it('should return correct structure', async () => {
            const customer = createMockCustomer(123)
            const orders = [createMockOrder(1, [{ product_id: 100 }])]

            fetchIntegrationProducts.mockResolvedValue([
                fromJS(createMockProduct(100)),
            ])

            const { result } = renderHook(
                () => useOrderProducts(customer, orders),
                { wrapper: createWrapper() },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current).toHaveProperty('products')
            expect(result.current).toHaveProperty('isLoading')
            expect(result.current).toHaveProperty('isError')
            expect(result.current).toHaveProperty('hasShopifyIntegration')

            expect(result.current.products).toBeInstanceOf(Map)
            expect(typeof result.current.isLoading).toBe('boolean')
            expect(typeof result.current.isError).toBe('boolean')
            expect(typeof result.current.hasShopifyIntegration).toBe('boolean')
        })
    })
})
