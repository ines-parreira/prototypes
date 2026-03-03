import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadTotalSalesByProductData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadTotalSalesByProductData'
import { useTotalSalesByProduct } from 'pages/aiAgent/analyticsAiAgent/hooks/useTotalSalesByProduct'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useTotalSalesByProduct')

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseTotalSalesByProduct = jest.mocked(useTotalSalesByProduct)

describe('useDownloadTotalSalesByProductData', () => {
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
        mockedUseTotalSalesByProduct.mockReturnValue({
            data: { chartData: undefined, currency: 'USD' },
            isFetching: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadTotalSalesByProductData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseTotalSalesByProduct.mockReturnValue({
            data: {
                chartData: [{ name: 'Product A', value: 1000 }],
                currency: 'USD',
            },
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadTotalSalesByProductData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty files when chartData is undefined', () => {
        mockedUseTotalSalesByProduct.mockReturnValue({
            data: { chartData: undefined, currency: 'USD' },
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadTotalSalesByProductData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when chartData is empty array', () => {
        mockedUseTotalSalesByProduct.mockReturnValue({
            data: { chartData: [], currency: 'USD' },
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadTotalSalesByProductData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return CSV file with product sales data', () => {
        const mockProductData = {
            chartData: [
                { name: 'Product A', value: 5000 },
                { name: 'Product B', value: 3000 },
                { name: 'Product C', value: 2000 },
            ],
            currency: 'USD',
        }

        mockedUseTotalSalesByProduct.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadTotalSalesByProductData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) => name.includes('total-sales-by-product')),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('product')
        expect(csvContent).toContain('total_sales')
        expect(csvContent).toContain('Product A')
        expect(csvContent).toContain('Product B')
        expect(csvContent).toContain('Product C')
    })

    it('should filter out products with zero value', () => {
        const mockProductData = {
            chartData: [
                { name: 'Product A', value: 5000 },
                { name: 'Product Zero', value: 0 },
                { name: 'Product C', value: 2000 },
            ],
            currency: 'USD',
        }

        mockedUseTotalSalesByProduct.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadTotalSalesByProductData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Product A')
        expect(csvContent).toContain('Product C')
        expect(csvContent).not.toContain('Product Zero')
    })

    it('should include date range in filename', () => {
        const mockProductData = {
            chartData: [{ name: 'Test Product', value: 1000 }],
            currency: 'USD',
        }

        mockedUseTotalSalesByProduct.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadTotalSalesByProductData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(fileNames[0]).toContain('total-sales-by-product')
        expect(fileNames[0]).toContain('.csv')
    })

    it('should return empty files when all products have zero value', () => {
        const mockProductData = {
            chartData: [
                { name: 'Product A', value: 0 },
                { name: 'Product B', value: 0 },
            ],
            currency: 'USD',
        }

        mockedUseTotalSalesByProduct.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadTotalSalesByProductData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('product')
        expect(csvContent).toContain('total_sales')
    })
})
