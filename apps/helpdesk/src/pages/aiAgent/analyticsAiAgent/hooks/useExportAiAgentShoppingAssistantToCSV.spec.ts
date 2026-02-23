import { useFlag } from '@repo/feature-flags'
import { act, renderHook } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadGmvInfluenceTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadGmvInfluenceTimeSeriesData'
import { useDownloadShoppingAssistantChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import { useDownloadTotalSalesByProductData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadTotalSalesByProductData'
import { useExportAiAgentShoppingAssistantToCSV } from 'pages/aiAgent/analyticsAiAgent/hooks/useExportAiAgentShoppingAssistantToCSV'
import * as fileUtils from 'utils/file'

jest.mock('@repo/feature-flags')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadTotalSalesByProductData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadGmvInfluenceTimeSeriesData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData',
)
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockUseFlag = jest.mocked(useFlag)
const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
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

        mockUseFlag.mockReturnValue(true)

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        mockedUseDashboardData.mockReturnValue({
            files: {
                'ai-agent-shopping-assistant - trends.csv': 'trends content',
            },
            fileName: 'ai-agent-shopping-assistant - trends.csv',
            isLoading: false,
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

    it('should return isLoading as true when KPI data is loading', () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
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
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
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
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
    })
})
