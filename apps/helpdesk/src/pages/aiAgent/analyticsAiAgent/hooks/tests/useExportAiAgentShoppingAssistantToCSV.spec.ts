import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { act, renderHook } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsAiAgentShoppingAssistantReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import { useDownloadGmvInfluenceTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadGmvInfluenceTimeSeriesData'
import { useDownloadShoppingAssistantChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import { useDownloadTotalSalesByProductData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadTotalSalesByProductData'
import { useExportAiAgentShoppingAssistantToCSV } from 'pages/aiAgent/analyticsAiAgent/hooks/useExportAiAgentShoppingAssistantToCSV'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import * as fileUtils from 'utils/file'

jest.mock('@repo/feature-flags')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig',
)
jest.mock('pages/aiAgent/analyticsOverview/utils/buildCustomDashboard')
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
const mockedUseGetManagedDashboardsLayoutConfig = jest.mocked(
    useGetManagedDashboardsLayoutConfig,
)
const mockedBuildKpiDashboard = jest.mocked(buildCustomDashboard)
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

const mockPeriod = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-31T23:59:59Z',
}

const dashboardFiles = {
    'ai-agent-shopping-assistant - trends.csv': 'trends content',
}

const totalSalesByProductFiles = {
    'total-sales-by-product.csv': 'product,total_sales\nProduct A,$10,000',
}

const gmvInfluenceTimeSeriesFiles = {
    'gmv-influence-timeseries.csv': 'date,total_sales\n2024-01-01,$5,000',
}

const channelPerformanceFiles = {
    'shopping-assistant-channel-performance.csv':
        'channel,automation_rate\nChat,85%',
}

const topProductsFiles = {
    'shopping-assistant-top-products.csv':
        'product_name,times_recommended\nProduct A,100',
}

describe('useExportAiAgentShoppingAssistantToCSV', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockReturnValue(false)

        mockedUseGetManagedDashboardsLayoutConfig.mockReturnValue({
            layoutConfig: { sections: [] } as any,
            isLoading: false,
        })

        mockedBuildKpiDashboard.mockReturnValue({
            id: 0,
            name: 'ai-agent-shopping-assistant',
            analytics_filter_id: 0,
            children: [],
            emoji: null,
        } as any)

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        mockedUseDashboardData.mockReturnValue({
            files: dashboardFiles,
            fileName: 'ai-agent-shopping-assistant - trends.csv',
            isLoading: false,
        })

        mockedUseDownloadTotalSalesByProductData.mockReturnValue({
            files: totalSalesByProductFiles,
            isLoading: false,
        })

        mockedUseDownloadGmvInfluenceTimeSeriesData.mockReturnValue({
            files: gmvInfluenceTimeSeriesFiles,
            isLoading: false,
        })

        mockedUseDownloadShoppingAssistantChannelPerformanceData.mockReturnValue(
            {
                files: channelPerformanceFiles,
                isLoading: false,
            },
        )

        mockedUseDownloadShoppingAssistantTopProductsData.mockReturnValue({
            files: topProductsFiles,
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

    it('should call saveZippedFiles when triggerDownload is called', async () => {
        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        await act(async () => {
            await result.current.triggerDownload()
        })

        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining('ai-agent-shopping-assistant'),
        )
    })

    it('should call buildCustomDashboard with the name, layout, and both feature flags', () => {
        mockUseFlag.mockReturnValue(true)
        renderHook(() => useExportAiAgentShoppingAssistantToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'ai-agent-shopping-assistant',
            expect.any(Object),
            true,
            true,
        )
    })

    it('should call useDashboardData with the ShoppingAssistant report config charts', () => {
        renderHook(() => useExportAiAgentShoppingAssistantToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            true,
            AnalyticsAiAgentShoppingAssistantReportConfig.charts,
        )
    })

    describe('when isNewChartsEnabled is false', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation((key) => {
                if (
                    key ===
                    FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns
                )
                    return false
                return false
            })
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

        it('should include all expected files in the ZIP', async () => {
            const { result } = renderHook(() =>
                useExportAiAgentShoppingAssistantToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            const fileNames = Object.keys(filesArg)

            expect(fileNames).toHaveLength(5)
            expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
            expect(
                fileNames.some((name) =>
                    name.includes('total-sales-by-product'),
                ),
            ).toBe(true)
            expect(
                fileNames.some((name) =>
                    name.includes('gmv-influence-timeseries'),
                ),
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

        it('should include only dashboard files when download data files are empty', async () => {
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

            expect(fileNames).toHaveLength(1)
            expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
        })
    })

    describe('when isNewChartsEnabled is true', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should return isLoading as false even when old download hooks are loading', () => {
            mockedUseDownloadTotalSalesByProductData.mockReturnValue({
                files: {},
                isLoading: true,
            })
            mockedUseDownloadGmvInfluenceTimeSeriesData.mockReturnValue({
                files: {},
                isLoading: true,
            })
            mockedUseDownloadShoppingAssistantChannelPerformanceData.mockReturnValue(
                {
                    files: {},
                    isLoading: true,
                },
            )
            mockedUseDownloadShoppingAssistantTopProductsData.mockReturnValue({
                files: {},
                fileName: '',
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useExportAiAgentShoppingAssistantToCSV(),
            )

            expect(result.current.isLoading).toBe(false)
        })

        it('should include only dashboard files in the ZIP', async () => {
            const { result } = renderHook(() =>
                useExportAiAgentShoppingAssistantToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(filesArg).toEqual(dashboardFiles)
        })
    })
})
