import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useShoppingAssistantTopProductsMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'
import { fetchIntegrationProducts } from 'state/integrations/helpers'

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: jest.fn(),
    }),
)
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    ...jest.requireActual('domains/reporting/hooks/useStatsMetricPerDimension'),
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/aiSalesAgentActivity', () => ({
    aiSalesRecommendedProductCountPerProductQueryFactoryV2: jest.fn(() => ({
        metricName:
            'ai-agent-shopping-assistant-product-recommendations-per-product',
    })),
}))
jest.mock('domains/reporting/models/scopes/aiSalesAgentBuyThroughRate', () => ({
    aiSalesAgentBuyThroughRatePerProductQueryFactoryV2: jest.fn(() => ({
        metricName: 'ai-agent-shopping-assistant-buy-through-rate-per-product',
    })),
}))
jest.mock('domains/reporting/models/scopes/convertCampaignEvents', () => ({
    aiSalesAgentProductClicksQueryFactoryV2: jest.fn(() => ({
        metricName: 'ai-agent-shopping-assistant-clicks-per-product',
    })),
}))
jest.mock('state/integrations/helpers', () => ({
    fetchIntegrationProducts: jest.fn(),
}))
jest.mock('hooks/useAppSelector', () => jest.fn())

const mockUseStatsFilters = jest.requireMock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
).useStatsFilters as jest.Mock

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockUseAppSelector = jest.requireMock('hooks/useAppSelector') as jest.Mock

const mockFetchIntegrationProducts =
    fetchIntegrationProducts as unknown as jest.MockedFunction<
        (
            integrationId: number,
            productIds: number[],
        ) => Promise<{ toJS: () => unknown }[]>
    >

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

const RECOMMENDATIONS_METRIC =
    'ai-agent-shopping-assistant-product-recommendations-per-product'
const CLICKS_METRIC = 'ai-agent-shopping-assistant-clicks-per-product'
const BTR_METRIC = 'ai-agent-shopping-assistant-buy-through-rate-per-product'

describe('useShoppingAssistantTopProductsMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: { period: mockPeriod },
            userTimezone: 'UTC',
        })
        mockUseStatsMetricPerDimension.mockReturnValue(emptyMetric)
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
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
                    {
                        productRecommended: [123],
                        storeIntegrationId: 42,
                        timesRecommended: 50,
                    },
                ])
            }
            return emptyMetric
        })
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
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
                    {
                        productRecommended: [123],
                        storeIntegrationId: 42,
                        timesRecommended: 100,
                    },
                ])
            }
            if (query.metricName === CLICKS_METRIC) {
                return makeClicksMetric([{ productId: 123, uniqClicks: 25 }])
            }
            if (query.metricName === BTR_METRIC) {
                return makeBtrMetric([
                    { productRecommended: [123], productBuyThroughRate: 0.1 },
                ])
            }
            return emptyMetric
        })
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
        ])

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
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
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
                ])
            }
            return emptyMetric
        })

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
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
                    {
                        productRecommended: [456],
                        storeIntegrationId: 42,
                        timesRecommended: 20,
                    },
                ])
            }
            return emptyMetric
        })
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
        ])

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
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
                    {
                        productRecommended: [123],
                        storeIntegrationId: 42,
                        timesRecommended: 10,
                    },
                ])
            }
            return emptyMetric
        })
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
        ])

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
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
                    {
                        productRecommended: [123],
                        storeIntegrationId: 42,
                        timesRecommended: 10,
                    },
                ])
            }
            return emptyMetric
        })
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
        ])

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
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
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
                ])
            }
            return emptyMetric
        })

        renderHook(() => useShoppingAssistantTopProductsMetrics(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(mockFetchIntegrationProducts).toHaveBeenCalledWith(42, [10])
            expect(mockFetchIntegrationProducts).toHaveBeenCalledWith(99, [20])
        })
    })

    it('handles rows with multiple product IDs in productRecommended', async () => {
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
                    {
                        productRecommended: [10, 20],
                        storeIntegrationId: 42,
                        timesRecommended: 5,
                    },
                ])
            }
            return emptyMetric
        })

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
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([], { isFetching: true })
            }
            return emptyMetric
        })

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isFetching true when clicks query is fetching', () => {
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === CLICKS_METRIC) {
                return makeClicksMetric([], { isFetching: true })
            }
            return emptyMetric
        })

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isFetching true when BTR query is fetching', () => {
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === BTR_METRIC) {
                return makeBtrMetric([], { isFetching: true })
            }
            return emptyMetric
        })

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isFetching true when products query is fetching', () => {
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
                    {
                        productRecommended: [123],
                        storeIntegrationId: 42,
                        timesRecommended: 5,
                    },
                ])
            }
            return emptyMetric
        })
        mockFetchIntegrationProducts.mockReturnValue(new Promise(() => {}))

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isError true when recommendations query errors', () => {
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([], { isError: true })
            }
            return emptyMetric
        })

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            { wrapper: createWrapper() },
        )

        expect(result.current.isError).toBe(true)
    })

    it('returns isError true when products query errors', async () => {
        mockUseStatsMetricPerDimension.mockImplementation((query: any) => {
            if (query.metricName === RECOMMENDATIONS_METRIC) {
                return makeRecommendationsMetric([
                    {
                        productRecommended: [123],
                        storeIntegrationId: 42,
                        timesRecommended: 5,
                    },
                ])
            }
            return emptyMetric
        })
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

    it('calls useStatsMetricPerDimension three times for recommendations, clicks, and BTR', () => {
        renderHook(() => useShoppingAssistantTopProductsMetrics(), {
            wrapper: createWrapper(),
        })

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledTimes(3)
    })
})
