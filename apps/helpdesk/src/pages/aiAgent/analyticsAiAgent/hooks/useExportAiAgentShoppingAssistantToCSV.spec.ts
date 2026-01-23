import { act, renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as fileUtils from 'utils/file'

import { useDownloadGmvInfluenceTimeSeriesData } from './useDownloadGmvInfluenceTimeSeriesData'
import { useDownloadShoppingAssistantChannelPerformanceData } from './useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsData } from './useDownloadShoppingAssistantTopProductsData'
import { useDownloadTotalSalesByProductData } from './useDownloadTotalSalesByProductData'
import { useExportAiAgentShoppingAssistantToCSV } from './useExportAiAgentShoppingAssistantToCSV'
import { useOrdersInfluencedMetric } from './useOrdersInfluencedMetric'
import { useResolvedInteractionsMetric } from './useResolvedInteractionsMetric'
import { useRevenuePerInteractionMetric } from './useRevenuePerInteractionMetric'
import { useTotalSalesMetric } from './useTotalSalesMetric'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('./useTotalSalesMetric')
jest.mock('./useOrdersInfluencedMetric')
jest.mock('./useResolvedInteractionsMetric')
jest.mock('./useRevenuePerInteractionMetric')
jest.mock('./useDownloadTotalSalesByProductData')
jest.mock('./useDownloadGmvInfluenceTimeSeriesData')
jest.mock('./useDownloadShoppingAssistantChannelPerformanceData')
jest.mock('./useDownloadShoppingAssistantTopProductsData')
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseTotalSalesMetric = jest.mocked(useTotalSalesMetric)
const mockedUseOrdersInfluencedMetric = jest.mocked(useOrdersInfluencedMetric)
const mockedUseResolvedInteractionsMetric = jest.mocked(
    useResolvedInteractionsMetric,
)
const mockedUseRevenuePerInteractionMetric = jest.mocked(
    useRevenuePerInteractionMetric,
)
const mockedUseDownloadTotalSalesByProductData = jest.mocked(
    useDownloadTotalSalesByProductData,
)
const mockedUseDownloadGmvInfluenceTimeSeriesData = jest.mocked(
    useDownloadGmvInfluenceTimeSeriesData,
)
const mockedUseDownloadShoppingAssistantChannelPerformanceData = jest.mocked(
    useDownloadShoppingAssistantChannelPerformanceData,
)
const mockedUseDownloadShoppingAssistantTopProductsData = jest.mocked(
    useDownloadShoppingAssistantTopProductsData,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAiAgentShoppingAssistantToCSV', () => {
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

        mockedUseTotalSalesMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Total sales',
                value: 75000,
                prevValue: 65000,
            },
        })

        mockedUseOrdersInfluencedMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Orders influenced',
                value: 500,
                prevValue: 450,
            },
        })

        mockedUseResolvedInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 2000,
                prevValue: 1800,
            },
        })

        mockedUseRevenuePerInteractionMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Revenue per interaction',
                value: 37.5,
                prevValue: 36.11,
            },
        })

        mockedUseDownloadTotalSalesByProductData.mockReturnValue({
            files: {
                'total-sales-by-product.csv':
                    'product,total_sales\nProduct A,$10,000',
            },
            isLoading: false,
        })

        mockedUseDownloadGmvInfluenceTimeSeriesData.mockReturnValue({
            files: {
                'gmv-influence-timeseries.csv':
                    'date,total_sales\n2024-01-01,$5,000',
            },
            isLoading: false,
        })

        mockedUseDownloadShoppingAssistantChannelPerformanceData.mockReturnValue(
            {
                files: {
                    'shopping-assistant-channel-performance.csv':
                        'channel,automation_rate\nChat,85%',
                },
                isLoading: false,
            },
        )

        mockedUseDownloadShoppingAssistantTopProductsData.mockReturnValue({
            files: {
                'shopping-assistant-top-products.csv':
                    'product_name,times_recommended\nProduct A,100',
            },
            fileName: 'shopping-assistant-top-products.csv',
            isLoading: false,
        })
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when total sales metric is loading', () => {
        mockedUseTotalSalesMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when orders influenced metric is loading', () => {
        mockedUseOrdersInfluencedMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automated interactions metric is loading', () => {
        mockedUseResolvedInteractionsMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when revenue per interaction metric is loading', () => {
        mockedUseRevenuePerInteractionMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when total sales by product data is loading', () => {
        mockedUseDownloadTotalSalesByProductData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when GMV influence time series is loading', () => {
        mockedUseDownloadGmvInfluenceTimeSeriesData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when channel performance data is loading', () => {
        mockedUseDownloadShoppingAssistantChannelPerformanceData.mockReturnValue(
            {
                files: {},
                isLoading: true,
            },
        )

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when top products data is loading', () => {
        mockedUseDownloadShoppingAssistantTopProductsData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should call saveZippedFiles when triggerDownload is called', async () => {
        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        await act(async () => {
            await result.current.triggerDownload()
        })

        expect(mockedSaveZippedFiles).toHaveBeenCalled()
        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining('ai-agent-shopping-assistant'),
        )
    })

    it('should include all expected files in the ZIP', async () => {
        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(5)
        expect(fileNames.some((name) => name.includes('kpi-cards'))).toBe(true)
        expect(
            fileNames.some((name) => name.includes('total-sales-by-product')),
        ).toBe(true)
        expect(
            fileNames.some((name) => name.includes('gmv-influence-timeseries')),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('shopping-assistant-channel-performance'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('shopping-assistant-top-products'),
            ),
        ).toBe(true)
    })

    it('should include correct KPI data in CSV', async () => {
        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const kpiFileName = Object.keys(filesArg).find((name) =>
            name.includes('kpi-cards'),
        )

        expect(kpiFileName).toBeDefined()
        const kpiContent = filesArg[kpiFileName!]

        expect(kpiContent).toContain('Total sales')
        expect(kpiContent).toContain('Orders influenced')
        expect(kpiContent).toContain('Automated interactions')
        expect(kpiContent).toContain('Revenue per interaction')
    })

    it('should handle empty download data files', async () => {
        mockedUseDownloadTotalSalesByProductData.mockReturnValue({
            files: {},
            isLoading: false,
        })

        mockedUseDownloadGmvInfluenceTimeSeriesData.mockReturnValue({
            files: {},
            isLoading: false,
        })

        mockedUseDownloadShoppingAssistantChannelPerformanceData.mockReturnValue(
            {
                files: {},
                isLoading: false,
            },
        )

        mockedUseDownloadShoppingAssistantTopProductsData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(1)
        expect(fileNames.some((name) => name.includes('kpi-cards'))).toBe(true)
    })
})
