import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'

import { useDownloadShoppingAssistantTopProductsData } from './useDownloadShoppingAssistantTopProductsData'
import { useShoppingAssistantTopProductsMetrics } from './useShoppingAssistantTopProductsMetrics'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('./useShoppingAssistantTopProductsMetrics')

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseShoppingAssistantTopProductsMetrics = jest.mocked(
    useShoppingAssistantTopProductsMetrics,
)

describe('useDownloadShoppingAssistantTopProductsData', () => {
    const mockPeriod = {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)
    })

    it('should return isLoading as true when data is fetching', () => {
        mockedUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty files when data is undefined', () => {
        mockedUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when data is empty array', () => {
        mockedUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return CSV file with product data', () => {
        const mockProductData = [
            {
                product: { title: 'Product A' },
                metrics: {
                    [ProductTableKeys.NumberOfRecommendations]: 100,
                    [ProductTableKeys.CTR]: 0.25,
                    [ProductTableKeys.BTR]: 0.1,
                },
            },
            {
                product: { title: 'Product B' },
                metrics: {
                    [ProductTableKeys.NumberOfRecommendations]: 50,
                    [ProductTableKeys.CTR]: 0.3,
                    [ProductTableKeys.BTR]: 0.15,
                },
            },
        ]

        mockedUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('shopping-assistant-top-products'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('product_name')
        expect(csvContent).toContain('times_recommended')
        expect(csvContent).toContain('click_through_rate')
        expect(csvContent).toContain('buy_through_rate')
        expect(csvContent).toContain('Product A')
        expect(csvContent).toContain('Product B')
    })

    it('should handle undefined metric values', () => {
        const mockProductData = [
            {
                product: { title: 'Product A' },
                metrics: {
                    [ProductTableKeys.NumberOfRecommendations]: undefined,
                    [ProductTableKeys.CTR]: undefined,
                    [ProductTableKeys.BTR]: undefined,
                },
            },
        ]

        mockedUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Product A')
    })

    it('should include date range in filename', () => {
        const mockProductData = [
            {
                product: { title: 'Test Product' },
                metrics: {
                    [ProductTableKeys.NumberOfRecommendations]: 10,
                    [ProductTableKeys.CTR]: 0.1,
                    [ProductTableKeys.BTR]: 0.05,
                },
            },
        ]

        mockedUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(fileNames[0]).toContain('shopping-assistant-top-products')
        expect(fileNames[0]).toContain('.csv')
    })

    it('should format metrics correctly', () => {
        const mockProductData = [
            {
                product: { title: 'Product X' },
                metrics: {
                    [ProductTableKeys.NumberOfRecommendations]: 1234,
                    [ProductTableKeys.CTR]: 0.456,
                    [ProductTableKeys.BTR]: 0.789,
                },
            },
        ]

        mockedUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Product X')
    })
})
