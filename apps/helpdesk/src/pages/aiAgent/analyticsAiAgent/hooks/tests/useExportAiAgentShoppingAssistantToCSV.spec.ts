import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
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

const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)
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

const newSalesChannelFiles = {
    '2024-01-01_2024-01-31-ai_agent_sales_performance_by_channel_table.csv':
        '"AI Agent Sales Performance By Channel"\r\n"email"',
}

const topProductsFiles = {
    'shopping-assistant-top-products.csv':
        'product_name,times_recommended\nProduct A,100',
}

describe('useExportAiAgentShoppingAssistantToCSV', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

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

    it('should return isLoading as true when trend cards flag is loading', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
                return { value: false, isLoading: true }
            return { value: false, isLoading: false }
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when charts flag is loading', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (
                key ===
                FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns
            )
                return { value: false, isLoading: true }
            return { value: false, isLoading: false }
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
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

    it('should return isLoading as true when total sales by product data is loading and graphs flag is disabled', () => {
        mockedUseDownloadTotalSalesByProductData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when total sales by product data is loading but graphs flag is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (
                key ===
                FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns
            )
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })
        mockedUseDownloadTotalSalesByProductData.mockReturnValue({
            files: {},
            isLoading: true,
        })
        mockedUseDownloadGmvInfluenceTimeSeriesData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when GMV influence time series is loading and graphs flag is disabled', () => {
        mockedUseDownloadGmvInfluenceTimeSeriesData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when legacy channel data is loading and tables flag is disabled', () => {
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

    it('should not reflect legacy channel isLoading when tables flag is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTables)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })
        mockedUseDownloadShoppingAssistantChannelPerformanceData.mockReturnValue(
            {
                files: {},
                isLoading: true,
            },
        )

        const { result } = renderHook(() =>
            useExportAiAgentShoppingAssistantToCSV(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when top products data is loading and tables flag is disabled', () => {
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

    it('should not reflect top products isLoading when tables flag is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTables)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })
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

    it('should call buildCustomDashboard with the name, layout, and feature flags', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        renderHook(() => useExportAiAgentShoppingAssistantToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'ai-agent-shopping-assistant',
            expect.any(Object),
            true,
            true,
            true,
        )
    })

    it('should call buildCustomDashboard with false when tables flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTables)
                return { value: false, isLoading: false }
            return { value: true, isLoading: false }
        })
        renderHook(() => useExportAiAgentShoppingAssistantToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'ai-agent-shopping-assistant',
            expect.any(Object),
            true,
            true,
            false,
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

    it('should include all expected files in the ZIP when tables flag is disabled', async () => {
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

    it('should include only dashboard files in the ZIP when all flags are enabled', async () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        mockedUseDashboardData.mockReturnValue({
            files: {
                ...dashboardFiles,
                ...newSalesChannelFiles,
            },
            fileName: 'ai-agent-shopping-assistant - trends.csv',
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

        expect(fileNames).toHaveLength(2)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('ai_agent_sales_performance_by_channel_table'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) => name.includes('total-sales-by-product')),
        ).toBe(false)
        expect(
            fileNames.some((name) => name.includes('gmv-influence-timeseries')),
        ).toBe(false)
        expect(
            fileNames.some((name) =>
                name.includes('shopping-assistant-top-products'),
            ),
        ).toBe(false)
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

    describe('sales channel data based on AiAgentAnalyticsDashboardsTables flag', () => {
        it('uses channel data from useDashboardData when the tables flag is enabled', async () => {
            mockUseFlagWithLoading.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTables)
                    return { value: true, isLoading: false }
                return { value: false, isLoading: false }
            })

            mockedUseDashboardData.mockReturnValue({
                files: {
                    ...dashboardFiles,
                    ...newSalesChannelFiles,
                },
                fileName: 'ai-agent-shopping-assistant - trends.csv',
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

            expect(
                fileNames.some((name) =>
                    name.includes(
                        'ai_agent_sales_performance_by_channel_table',
                    ),
                ),
            ).toBe(true)
            expect(
                fileNames.some((name) =>
                    name.includes('shopping-assistant-channel-performance'),
                ),
            ).toBe(false)
        })

        it('uses legacy channel data when the tables flag is disabled', async () => {
            const { result } = renderHook(() =>
                useExportAiAgentShoppingAssistantToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            const fileNames = Object.keys(filesArg)

            expect(
                fileNames.some((name) =>
                    name.includes('shopping-assistant-channel-performance'),
                ),
            ).toBe(true)
            expect(
                fileNames.some((name) =>
                    name.includes(
                        'ai_agent_sales_performance_by_channel_table',
                    ),
                ),
            ).toBe(false)
        })

        it('reflects isLoading from legacy channel data when the tables flag is disabled', () => {
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
    })
})
