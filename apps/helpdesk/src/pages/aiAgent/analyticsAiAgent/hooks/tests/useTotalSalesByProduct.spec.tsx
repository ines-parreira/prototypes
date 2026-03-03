import type { ReactNode } from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { useTotalSalesByProduct } from 'pages/aiAgent/analyticsAiAgent/hooks/useTotalSalesByProduct'
import { fetchIntegrationProducts } from 'state/integrations/helpers'
import { reportError } from 'utils/errors'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend',
)
jest.mock('state/integrations/helpers')
jest.mock('utils/errors')

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useGmvInfluencedTrendMock = assumeMock(useGmvInfluencedTrend)
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

describe('useTotalSalesByProduct', () => {
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

    const defaultTrendData = {
        data: {
            value: 10000,
            prevValue: 8000,
            currency: 'USD',
        },
        isFetching: false,
        isError: false,
    }

    const defaultMetricPerDimension = {
        data: null,
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        useStatsFiltersMock.mockReturnValue(defaultStatsFilters)
        useGmvInfluencedTrendMock.mockReturnValue(defaultTrendData)
        useMetricPerDimensionMock.mockReturnValue(defaultMetricPerDimension)
        fetchIntegrationProductsMock.mockResolvedValue([])
    })

    it('should return initial state when no data is available', async () => {
        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                data: {
                    chartData: [],
                    totalValue: 10000,
                    prevTotalValue: 8000,
                    currency: 'USD',
                },
                isFetching: false,
                isError: false,
            })
        })
    })

    it('should return chart data with product names when products are fetched', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                    },
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '124',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '3000',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)

        const mockProducts = [
            { toJS: () => ({ id: 123, title: 'Product A' }) },
            { toJS: () => ({ id: 124, title: 'Product B' }) },
        ] as any
        fetchIntegrationProductsMock.mockResolvedValue(mockProducts)

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toHaveLength(2)
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toContainEqual({
                name: 'Product A',
                value: 5000,
            })
            expect(result.current.data.chartData).toContainEqual({
                name: 'Product B',
                value: 3000,
            })
        })
    })

    it('should fallback to product ID when product name is not available', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '999',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)
        fetchIntegrationProductsMock.mockResolvedValue([])

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toContainEqual({
                name: 'Product 999',
                value: 5000,
            })
        })
    })

    it('should filter out products with zero GMV', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                    },
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '124',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '0',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)
        fetchIntegrationProductsMock.mockResolvedValue([])

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toHaveLength(1)
            expect(result.current.data.chartData[0].value).toBe(5000)
        })
    })

    it('should group products by integration ID', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                    },
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '124',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '789',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '3000',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)

        const mockProducts456 = [
            { toJS: () => ({ id: 123, title: 'Product A' }) },
        ] as any
        const mockProducts789 = [
            { toJS: () => ({ id: 124, title: 'Product B' }) },
        ] as any

        fetchIntegrationProductsMock
            .mockResolvedValueOnce(mockProducts456)
            .mockResolvedValueOnce(mockProducts789)

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(fetchIntegrationProductsMock).toHaveBeenCalledWith(456, [
                123,
            ])
            expect(fetchIntegrationProductsMock).toHaveBeenCalledWith(789, [
                124,
            ])
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toHaveLength(2)
        })
    })

    it('should skip products with invalid integration ID or product ID when grouping for product fetch', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                    },
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]: '0',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '1000',
                    },
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '125',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '0',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '2000',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)
        fetchIntegrationProductsMock.mockResolvedValue([
            { toJS: () => ({ id: 123, title: 'Valid Product' }) } as any,
        ])

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(fetchIntegrationProductsMock).toHaveBeenCalledWith(456, [
                123,
            ])
            expect(fetchIntegrationProductsMock).toHaveBeenCalledTimes(1)
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toHaveLength(3)
            expect(result.current.data.chartData).toContainEqual({
                name: 'Valid Product',
                value: 5000,
            })
            expect(result.current.data.chartData).toContainEqual({
                name: 'Product 0',
                value: 1000,
            })
            expect(result.current.data.chartData).toContainEqual({
                name: 'Product 125',
                value: 2000,
            })
        })
    })

    it('should not duplicate products with same ID in the same integration', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                    },
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'EUR',
                        [AiSalesAgentOrdersMeasure.Gmv]: '3000',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)
        fetchIntegrationProductsMock.mockResolvedValue([
            { toJS: () => ({ id: 123, title: 'Product A' }) } as any,
        ])

        renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(fetchIntegrationProductsMock).toHaveBeenCalledWith(456, [
                123,
            ])
            expect(fetchIntegrationProductsMock).toHaveBeenCalledTimes(1)
        })
    })

    it('should return isFetching true when trend data is fetching', async () => {
        useGmvInfluencedTrendMock.mockReturnValue({
            ...defaultTrendData,
            isFetching: true,
        })

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isFetching true when GMV data is fetching', async () => {
        useMetricPerDimensionMock.mockReturnValue({
            ...defaultMetricPerDimension,
            isFetching: true,
        })

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError true when trend data has error', async () => {
        useGmvInfluencedTrendMock.mockReturnValue({
            ...defaultTrendData,
            isError: true,
        })

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(result.current.isError).toBe(true)
    })

    it('should return isError true when GMV data has error', async () => {
        useMetricPerDimensionMock.mockReturnValue({
            ...defaultMetricPerDimension,
            isError: true,
        })

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(result.current.isError).toBe(true)
    })

    it('should return null totalValue when trend data value is null', async () => {
        useGmvInfluencedTrendMock.mockReturnValue({
            data: {
                value: null,
                prevValue: null,
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(result.current.data.totalValue).toBeNull()
        expect(result.current.data.prevTotalValue).toBeNull()
    })

    it('should default to USD when currency is not available', async () => {
        useGmvInfluencedTrendMock.mockReturnValue({
            data: null as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(result.current.data.currency).toBe('USD')
    })

    it('should return empty chartData when allData is empty array', async () => {
        useMetricPerDimensionMock.mockReturnValue({
            data: {
                allData: [],
            } as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(result.current.data.chartData).toEqual([])
    })

    it('should handle products with undefined GMV gracefully', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)
        fetchIntegrationProductsMock.mockResolvedValue([])

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toEqual([])
        })
    })

    it('should report error when product fetch fails', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)
        fetchIntegrationProductsMock.mockRejectedValue(
            new Error('Network error'),
        )

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        renderHook(() => useTotalSalesByProduct(), {
            wrapper: ({ children }: { children: ReactNode }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
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
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '123',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '456',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)
        fetchIntegrationProductsMock.mockRejectedValue(
            new Error('Network error'),
        )

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: ({ children }: { children: ReactNode }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it('should call useStatsFilters to get filters', () => {
        renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(useStatsFiltersMock).toHaveBeenCalled()
    })

    it('should call useGmvInfluencedTrend with correct parameters', () => {
        renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(useGmvInfluencedTrendMock).toHaveBeenCalledWith(
            defaultStatsFilters.cleanStatsFilters,
            defaultStatsFilters.userTimezone,
        )
    })

    it('should call useMetricPerDimension with query factory result', () => {
        renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        expect(useMetricPerDimensionMock).toHaveBeenCalled()
    })

    it('should handle multiple products from multiple integrations', async () => {
        const gmvData = {
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '101',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '1',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '1000',
                    },
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '102',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '1',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '2000',
                    },
                    {
                        [AiSalesAgentOrdersDimension.InfluencedProductId]:
                            '201',
                        [AiSalesAgentOrdersDimension.IntegrationId]: '2',
                        [AiSalesAgentOrdersDimension.Currency]: 'USD',
                        [AiSalesAgentOrdersMeasure.Gmv]: '3000',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any

        useMetricPerDimensionMock.mockReturnValue(gmvData)

        fetchIntegrationProductsMock
            .mockResolvedValueOnce([
                { toJS: () => ({ id: 101, title: 'Product 1A' }) } as any,
                { toJS: () => ({ id: 102, title: 'Product 1B' }) } as any,
            ])
            .mockResolvedValueOnce([
                { toJS: () => ({ id: 201, title: 'Product 2A' }) } as any,
            ])

        const { result } = renderHook(() => useTotalSalesByProduct(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toHaveLength(3)
        })

        await waitFor(() => {
            expect(result.current.data.chartData).toContainEqual({
                name: 'Product 1A',
                value: 1000,
            })
            expect(result.current.data.chartData).toContainEqual({
                name: 'Product 1B',
                value: 2000,
            })
            expect(result.current.data.chartData).toContainEqual({
                name: 'Product 2A',
                value: 3000,
            })
        })
    })
})
