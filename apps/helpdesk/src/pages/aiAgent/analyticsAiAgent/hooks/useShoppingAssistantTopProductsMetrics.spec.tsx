import type { ReactNode } from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    useMetricPerDimension,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    ConvertTrackingEventsDimension,
    ConvertTrackingEventsMeasure,
} from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { fetchIntegrationProducts } from 'state/integrations/helpers'
import { reportError } from 'utils/errors'

import { useShoppingAssistantTopProductsMetrics } from './useShoppingAssistantTopProductsMetrics'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock('state/integrations/helpers')
jest.mock('utils/errors')

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchIntegrationProductsMock = assumeMock(fetchIntegrationProducts)
const reportErrorMock = assumeMock(reportError)

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useShoppingAssistantTopProductsMetrics', () => {
    const defaultStatsFilters = {
        cleanStatsFilters: {
            period: {
                start_datetime: '2024-01-01T00:00:00.000',
                end_datetime: '2024-01-31T23:59:59.999',
            },
        },
        userTimezone: 'UTC',
        granularity: ReportingGranularity.Day,
    }

    const defaultMetricPerDimension = {
        data: null,
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.resetAllMocks()

        useStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        useMetricPerDimensionMock.mockReturnValue(defaultMetricPerDimension)
        useMetricPerDimensionV2Mock.mockReturnValue(defaultMetricPerDimension)
        fetchIntegrationProductsMock.mockResolvedValue([])
    })

    it('should return empty data when no recommendations data is available', async () => {
        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                data: [],
                isFetching: false,
                isError: false,
            })
        })
    })

    it('should return product data with metrics when queries resolve', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '123',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '100',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const clicksData = {
            data: {
                allData: [
                    {
                        [ConvertTrackingEventsDimension.ProductId]: '123',
                        [ConvertTrackingEventsMeasure.UniqClicks]: '50',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const boughtData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersMeasure.UniqCount]: '10',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            if (query.metricName === 'ai-sales-agent-product-clicks') {
                return clicksData
            }
            if (query.metricName === 'ai-sales-agent-product-bought') {
                return boughtData
            }
            return defaultMetricPerDimension
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        const mockProducts = [
            {
                toJS: () => ({
                    id: 123,
                    title: 'Product A',
                    handle: 'product-a',
                    images: [],
                    options: [],
                    variants: [],
                    image: null,
                    created_at: '2024-01-01',
                }),
            },
        ] as any
        fetchIntegrationProductsMock.mockResolvedValue(mockProducts)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        await waitFor(() => {
            expect(result.current.data[0].product.title).toBe('Product A')
        })

        expect(result.current.data[0].metrics).toEqual({
            [ProductTableKeys.NumberOfRecommendations]: 100,
            [ProductTableKeys.CTR]: 50,
            [ProductTableKeys.BTR]: 10,
        })
    })

    it('should fallback to product ID when product details are not available', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '999',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '50',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            return { data: null, isFetching: false, isError: false }
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        fetchIntegrationProductsMock.mockResolvedValue([])

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0].product.title).toBe('Product 999')
    })

    it('should group products by integration ID', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '123',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '100',
                    },
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '124',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '789',
                        'AiSalesAgentConversations.count': '50',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            return { data: null, isFetching: false, isError: false }
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        const mockProducts456 = [
            {
                toJS: () => ({
                    id: 123,
                    title: 'Product A',
                    handle: 'product-a',
                    images: [],
                    options: [],
                    variants: [],
                    image: null,
                    created_at: '2024-01-01',
                }),
            },
        ] as any
        const mockProducts789 = [
            {
                toJS: () => ({
                    id: 124,
                    title: 'Product B',
                    handle: 'product-b',
                    images: [],
                    options: [],
                    variants: [],
                    image: null,
                    created_at: '2024-01-01',
                }),
            },
        ] as any

        fetchIntegrationProductsMock
            .mockResolvedValueOnce(mockProducts456)
            .mockResolvedValueOnce(mockProducts789)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(fetchIntegrationProductsMock).toHaveBeenCalledWith(456, [
                123,
            ])
            expect(fetchIntegrationProductsMock).toHaveBeenCalledWith(789, [
                124,
            ])
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2)
        })
    })

    it('should skip products with invalid integration ID or product ID', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '123',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '100',
                    },
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '0',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '50',
                    },
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '125',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '0',
                        'AiSalesAgentConversations.count': '25',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            return { data: null, isFetching: false, isError: false }
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        fetchIntegrationProductsMock.mockResolvedValue([
            {
                toJS: () => ({
                    id: 123,
                    title: 'Valid Product',
                    handle: 'valid-product',
                    images: [],
                    options: [],
                    variants: [],
                    image: null,
                    created_at: '2024-01-01',
                }),
            } as any,
        ])

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(fetchIntegrationProductsMock).toHaveBeenCalledWith(456, [
                123,
            ])
            expect(fetchIntegrationProductsMock).toHaveBeenCalledTimes(1)
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(3)
        })

        await waitFor(() => {
            expect(result.current.data[0].product.title).toBe('Valid Product')
            expect(result.current.data[1].product.title).toBe('Product 0')
            expect(result.current.data[2].product.title).toBe('Product 125')
        })
    })

    it('should not duplicate products with same ID from different integration rows', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '123',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '50',
                    },
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '123',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '50',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            return { data: null, isFetching: false, isError: false }
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        fetchIntegrationProductsMock.mockResolvedValue([
            {
                toJS: () => ({
                    id: 123,
                    title: 'Product A',
                    handle: 'product-a',
                    images: [],
                    options: [],
                    variants: [],
                    image: null,
                    created_at: '2024-01-01',
                }),
            } as any,
        ])

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(fetchIntegrationProductsMock).toHaveBeenCalledWith(456, [
                123,
            ])
            expect(fetchIntegrationProductsMock).toHaveBeenCalledTimes(1)
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })
    })

    it('should return isFetching true when recommendations data is fetching', async () => {
        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return {
                    data: null,
                    isFetching: true,
                    isError: false,
                }
            }
            return defaultMetricPerDimension
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isFetching true when clicks data is fetching', async () => {
        const mockImplementation = (query: any) => {
            if (query.metricName === 'ai-sales-agent-product-clicks') {
                return {
                    data: null,
                    isFetching: true,
                    isError: false,
                }
            }
            return defaultMetricPerDimension
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isFetching true when bought data is fetching', async () => {
        useMetricPerDimensionMock.mockReturnValue(defaultMetricPerDimension)
        useMetricPerDimensionV2Mock.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError true when recommendations data has error', async () => {
        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return {
                    data: null,
                    isFetching: false,
                    isError: true,
                }
            }
            return defaultMetricPerDimension
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return isError true when clicks data has error', async () => {
        const mockImplementation = (query: any) => {
            if (query.metricName === 'ai-sales-agent-product-clicks') {
                return {
                    data: null,
                    isFetching: false,
                    isError: true,
                }
            }
            return defaultMetricPerDimension
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return isError true when bought data has error', async () => {
        useMetricPerDimensionMock.mockReturnValue(defaultMetricPerDimension)
        useMetricPerDimensionV2Mock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should report error when product fetch fails', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '123',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '100',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            return { data: null, isFetching: false, isError: false }
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        fetchIntegrationProductsMock.mockRejectedValue(
            new Error('Network error'),
        )

        renderHook(() => useShoppingAssistantTopProductsMetrics(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Failed to fetch products for integration 456',
                }),
            )
        })
    })

    it('should return isError true when products query has error', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '123',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '100',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            return { data: null, isFetching: false, isError: false }
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        fetchIntegrationProductsMock.mockRejectedValue(
            new Error('Network error'),
        )

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it('should call useStatsFilters to get filters', () => {
        renderHook(() => useShoppingAssistantTopProductsMetrics(), {
            wrapper: createWrapper(),
        })

        expect(useStatsFiltersMock).toHaveBeenCalled()
    })

    it('should call useMetricPerDimension three times for recommendations, clicks, and bought', () => {
        renderHook(() => useShoppingAssistantTopProductsMetrics(), {
            wrapper: createWrapper(),
        })

        expect(useMetricPerDimensionMock).toHaveBeenCalledTimes(2)
        expect(useMetricPerDimensionV2Mock).toHaveBeenCalledTimes(1)
    })

    it('should handle empty allData array', async () => {
        useMetricPerDimensionMock
            .mockReturnValueOnce({
                data: { allData: [] } as any,
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: null,
                isFetching: false,
                isError: false,
            })
        useMetricPerDimensionV2Mock.mockReturnValueOnce({
            data: null,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.data).toEqual([])
    })

    it('should handle multiple products from multiple integrations', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '101',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '1',
                        'AiSalesAgentConversations.count': '100',
                    },
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '102',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '1',
                        'AiSalesAgentConversations.count': '200',
                    },
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '201',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '2',
                        'AiSalesAgentConversations.count': '300',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            return { data: null, isFetching: false, isError: false }
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        fetchIntegrationProductsMock.mockImplementation(
            async (integrationId: number) => {
                if (integrationId === 1) {
                    return [
                        {
                            toJS: () => ({
                                id: 101,
                                title: 'Product 1A',
                                handle: 'product-1a',
                                images: [],
                                options: [],
                                variants: [],
                                image: null,
                                created_at: '2024-01-01',
                            }),
                        } as any,
                        {
                            toJS: () => ({
                                id: 102,
                                title: 'Product 1B',
                                handle: 'product-1b',
                                images: [],
                                options: [],
                                variants: [],
                                image: null,
                                created_at: '2024-01-01',
                            }),
                        } as any,
                    ]
                }
                if (integrationId === 2) {
                    return [
                        {
                            toJS: () => ({
                                id: 201,
                                title: 'Product 2A',
                                handle: 'product-2a',
                                images: [],
                                options: [],
                                variants: [],
                                image: null,
                                created_at: '2024-01-01',
                            }),
                        } as any,
                    ]
                }
                return []
            },
        )

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(3)
        })

        await waitFor(() => {
            expect(result.current.data[0].product.title).toBe('Product 1A')
            expect(result.current.data[1].product.title).toBe('Product 1B')
            expect(result.current.data[2].product.title).toBe('Product 2A')
        })
    })

    it('should calculate CTR and BTR correctly', async () => {
        const recommendationsData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.ProductId]: '123',
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '456',
                        'AiSalesAgentConversations.count': '200',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const clicksData = {
            data: {
                allData: [
                    {
                        [ConvertTrackingEventsDimension.ProductId]: '123',
                        [ConvertTrackingEventsMeasure.UniqClicks]: '50',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const boughtData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersMeasure.UniqCount]: '20',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        const mockImplementation = (query: any) => {
            if (
                query.metricName ===
                'ai-sales-agent-shopping-assistant-top-products'
            ) {
                return recommendationsData
            }
            if (query.metricName === 'ai-sales-agent-product-clicks') {
                return clicksData
            }
            if (query.metricName === 'ai-sales-agent-product-bought') {
                return boughtData
            }
            return { data: null, isFetching: false, isError: false }
        }
        useMetricPerDimensionMock.mockImplementation(mockImplementation)
        useMetricPerDimensionV2Mock.mockImplementation(mockImplementation)

        fetchIntegrationProductsMock.mockResolvedValue([
            {
                toJS: () => ({
                    id: 123,
                    title: 'Product A',
                    handle: 'product-a',
                    images: [],
                    options: [],
                    variants: [],
                    image: null,
                    created_at: '2024-01-01',
                }),
            },
        ] as any)

        const { result } = renderHook(
            () => useShoppingAssistantTopProductsMetrics(),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0].metrics[ProductTableKeys.CTR]).toBe(25)
        expect(result.current.data[0].metrics[ProductTableKeys.BTR]).toBe(10)
    })
})
