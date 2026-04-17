import type { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import useAppSelector from 'hooks/useAppSelector'
import { useBuyThroughRatePerProduct } from 'pages/aiAgent/analyticsAiAgent/hooks/useBuyThroughRatePerProduct'
import { useProductClicksPerProduct } from 'pages/aiAgent/analyticsAiAgent/hooks/useProductClicksPerProduct'
import { useTimesRecommendedPerProduct } from 'pages/aiAgent/analyticsAiAgent/hooks/useRecommendedProductCountPerProduct'
import { useShoppingAssistantTopProductsMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'
import { fetchIntegrationProducts } from 'state/integrations/helpers'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useRecommendedProductCountPerProduct',
)
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useProductClicksPerProduct')
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useBuyThroughRatePerProduct')
jest.mock('state/integrations/helpers')
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockUseTimesRecommendedPerProduct = assumeMock(
    useTimesRecommendedPerProduct,
)
const mockUseProductClicksPerProduct = assumeMock(useProductClicksPerProduct)
const mockUseBuyThroughRatePerProduct = assumeMock(useBuyThroughRatePerProduct)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockFetchIntegrationProducts = assumeMock(fetchIntegrationProducts)

const mockPeriod = {
    start_datetime: '2024-01-01T00:00:00.000',
    end_datetime: '2024-01-31T23:59:59.999',
}

const emptyMetric = {
    data: { value: null, decile: null, allData: [], allValues: [] },
    isFetching: false,
    isError: false,
}

const makeRecommendationsMetric = (
    rows: {
        productRecommended: number[]
        storeIntegrationId: number
        timesRecommended: number
    }[],
    overrides: Partial<{ isFetching: boolean; isError: boolean }> = {},
) => ({
    data: {
        value: null,
        decile: null,
        allValues: [],
        allData: rows.map((row) => ({
            productRecommended: JSON.stringify(row.productRecommended),
            storeIntegrationId: row.storeIntegrationId,
            timesRecommended: row.timesRecommended,
        })),
    },
    isFetching: false,
    isError: false,
    ...overrides,
})

const makeClicksMetric = (
    rows: { productId: number; uniqClicks: number }[],
    overrides: Partial<{ isFetching: boolean; isError: boolean }> = {},
) => ({
    data: {
        value: null,
        decile: null,
        allValues: [],
        allData: rows.map((row) => ({
            productId: row.productId,
            uniqClicks: row.uniqClicks,
        })),
    },
    isFetching: false,
    isError: false,
    ...overrides,
})

const makeBtrMetric = (
    rows: { productRecommended: number[]; productBuyThroughRate: number }[],
    overrides: Partial<{ isFetching: boolean; isError: boolean }> = {},
) => ({
    data: {
        value: null,
        decile: null,
        allValues: [],
        allData: rows.map((row) => ({
            productRecommended: JSON.stringify(row.productRecommended),
            productBuyThroughRate: row.productBuyThroughRate,
        })),
    },
    isFetching: false,
    isError: false,
    ...overrides,
})

const makeShopifyIntegration = (id: number, shopDomain: string) => ({
    id,
    meta: { shop_domain: shopDomain },
})

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useShoppingAssistantTopProductsMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: { period: mockPeriod },
            userTimezone: 'UTC',
        } as any)
        mockUseTimesRecommendedPerProduct.mockReturnValue(emptyMetric as any)
        mockUseProductClicksPerProduct.mockReturnValue(emptyMetric as any)
        mockUseBuyThroughRatePerProduct.mockReturnValue(emptyMetric as any)
        mockFetchIntegrationProducts.mockResolvedValue([])
        mockUseAppSelector.mockReturnValue([])
    })

    it('returns empty data when no recommendations are available', () => {
        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.flatData).toEqual([])
    })

    it('renders fallback rows while product details are still loading', () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [123],
                    storeIntegrationId: 42,
                    timesRecommended: 50,
                },
            ]) as any,
        )
        mockFetchIntegrationProducts.mockReturnValue(new Promise(() => {}))

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.flatData).toHaveLength(1)
        expect(result.current.productNameMap['123']).toBe('Product 123')
        expect(result.current.isFetching).toBe(true)
    })

    it('maps product data with CTR computed from clicks/recommendations and pre-computed BTR', async () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [123],
                    storeIntegrationId: 42,
                    timesRecommended: 100,
                },
            ]) as any,
        )
        mockUseProductClicksPerProduct.mockReturnValue(
            makeClicksMetric([{ productId: 123, uniqClicks: 25 }]) as any,
        )
        mockUseBuyThroughRatePerProduct.mockReturnValue(
            makeBtrMetric([
                { productRecommended: [123], productBuyThroughRate: 0.1 },
            ]) as any,
        )
        mockFetchIntegrationProducts.mockResolvedValue([
            {
                toJS: () => ({
                    id: 123,
                    title: 'Product A',
                    handle: 'product-a',
                    image: null,
                    images: [],
                    options: [],
                    variants: [],
                    created_at: '2024-01-01',
                }),
            },
        ] as any)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.productNameMap['123']).toBe('Product A')
        })

        const row = result.current.flatData[0]
        expect(row[ProductTableKeys.NumberOfRecommendations]).toBe(100)
        expect(row[ProductTableKeys.CTR]).toBe(0.25)
        expect(row[ProductTableKeys.BTR]).toBe(0.1)
    })

    it('sums timesRecommended across bundles when the same product appears in multiple rows', () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [123, 456],
                    storeIntegrationId: 42,
                    timesRecommended: 10,
                },
                {
                    productRecommended: [123, 789],
                    storeIntegrationId: 42,
                    timesRecommended: 5,
                },
            ]) as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(
            result.current.flatData.find((r) => r.entity === '123')?.[
                ProductTableKeys.NumberOfRecommendations
            ],
        ).toBe(15)
        expect(
            result.current.flatData.find((r) => r.entity === '456')?.[
                ProductTableKeys.NumberOfRecommendations
            ],
        ).toBe(10)
    })

    it('defaults to 0 when a metric value is missing for a product', async () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [456],
                    storeIntegrationId: 42,
                    timesRecommended: 20,
                },
            ]) as any,
        )
        mockFetchIntegrationProducts.mockResolvedValue([
            {
                toJS: () => ({
                    id: 456,
                    title: 'Product B',
                    handle: 'product-b',
                    image: null,
                    images: [],
                    options: [],
                    variants: [],
                    created_at: '2024-01-01',
                }),
            },
        ] as any)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.productNameMap['456']).toBe('Product B')
        })

        const row = result.current.flatData[0]
        expect(row[ProductTableKeys.CTR]).toBe(0)
        expect(row[ProductTableKeys.BTR]).toBe(0)
    })

    it('builds product URL from shop domain and handle when integration is available', async () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [123],
                    storeIntegrationId: 42,
                    timesRecommended: 10,
                },
            ]) as any,
        )
        mockUseAppSelector.mockReturnValue([
            makeShopifyIntegration(42, 'my-store.myshopify.com'),
        ])
        mockFetchIntegrationProducts.mockResolvedValue([
            {
                toJS: () => ({
                    id: 123,
                    title: 'Product A',
                    handle: 'product-a',
                    image: null,
                    images: [],
                    options: [],
                    variants: [],
                    created_at: '2024-01-01',
                }),
            },
        ] as any)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.productNameMap['123']).toBe('Product A')
        })

        expect(result.current.productUrlMap['123']).toBe(
            'https://my-store.myshopify.com/products/product-a',
        )
    })

    it('sets empty URL when no shop domain is available for the integration', async () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [123],
                    storeIntegrationId: 42,
                    timesRecommended: 10,
                },
            ]) as any,
        )
        mockFetchIntegrationProducts.mockResolvedValue([
            {
                toJS: () => ({
                    id: 123,
                    title: 'Product A',
                    handle: 'product-a',
                    image: null,
                    images: [],
                    options: [],
                    variants: [],
                    created_at: '2024-01-01',
                }),
            },
        ] as any)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.productNameMap['123']).toBe('Product A')
        })

        expect(result.current.productUrlMap['123']).toBeUndefined()
    })

    it('fetches products grouped by their store integration from the data', async () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [10],
                    storeIntegrationId: 42,
                    timesRecommended: 5,
                },
                {
                    productRecommended: [20],
                    storeIntegrationId: 99,
                    timesRecommended: 3,
                },
            ]) as any,
        )

        renderHook(() => useShoppingAssistantTopProductsMetrics(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(mockFetchIntegrationProducts).toHaveBeenCalledWith(42, [10])
            expect(mockFetchIntegrationProducts).toHaveBeenCalledWith(99, [20])
        })
    })

    it('handles rows with multiple product IDs in productRecommended', async () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [10, 20],
                    storeIntegrationId: 42,
                    timesRecommended: 5,
                },
            ]) as any,
        )

        renderHook(() => useShoppingAssistantTopProductsMetrics(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(mockFetchIntegrationProducts).toHaveBeenCalledWith(
                42,
                expect.arrayContaining([10, 20]),
            )
        })
    })

    it('returns isFetching true when recommendations query is fetching', () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([], { isFetching: true }) as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isFetching true when clicks query is fetching', () => {
        mockUseProductClicksPerProduct.mockReturnValue(
            makeClicksMetric([], { isFetching: true }) as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isFetching true when BTR query is fetching', () => {
        mockUseBuyThroughRatePerProduct.mockReturnValue(
            makeBtrMetric([], { isFetching: true }) as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isFetching true when products query is fetching', () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [123],
                    storeIntegrationId: 42,
                    timesRecommended: 5,
                },
            ]) as any,
        )
        mockFetchIntegrationProducts.mockReturnValue(new Promise(() => {}))

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isError true when recommendations query errors', () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([], { isError: true }) as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isError).toBe(true)
    })

    it('returns isError true when products query errors', async () => {
        mockUseTimesRecommendedPerProduct.mockReturnValue(
            makeRecommendationsMetric([
                {
                    productRecommended: [123],
                    storeIntegrationId: 42,
                    timesRecommended: 5,
                },
            ]) as any,
        )
        mockFetchIntegrationProducts.mockRejectedValue(
            new Error('Network error'),
        )

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it('calls each metric hook once per render', () => {
        renderHook(() => useShoppingAssistantTopProductsMetrics(), {
            wrapper: createWrapper(),
        })

        expect(mockUseTimesRecommendedPerProduct).toHaveBeenCalledTimes(1)
        expect(mockUseProductClicksPerProduct).toHaveBeenCalledTimes(1)
        expect(mockUseBuyThroughRatePerProduct).toHaveBeenCalledTimes(1)
    })
})
