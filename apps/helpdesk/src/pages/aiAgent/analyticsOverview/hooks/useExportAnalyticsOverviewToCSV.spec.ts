import { act, renderHook } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type {
    DashboardChartSchema,
    DashboardSectionSchema,
} from 'domains/reporting/pages/dashboards/types'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from 'pages/aiAgent/analyticsOverview/config/defaultLayoutConfig'
import { useDownloadAutomationRateByFeatureData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateByFeatureData'
import { useDownloadAutomationRateTimeSeriesData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateTimeSeriesData'
import { useDownloadPerformanceBreakdownData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'
import * as fileUtils from 'utils/file'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData',
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateByFeatureData',
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateTimeSeriesData',
)
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedUseDownloadPerformanceBreakdownData = jest.mocked(
    useDownloadPerformanceBreakdownData,
)
const mockedUseDownloadAutomationRateByFeatureData = jest.mocked(
    useDownloadAutomationRateByFeatureData,
)
const mockedUseDownloadAutomationRateTimeSeriesData = jest.mocked(
    useDownloadAutomationRateTimeSeriesData,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAnalyticsOverviewToCSV', () => {
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

        mockedUseDashboardData.mockReturnValue({
            files: {
                'analytics-overview - trends.csv':
                    ',current period,previous period\nOverall automation rate,90%,85%',
            },
            fileName: 'analytics-overview - trends.csv',
            isLoading: false,
        })

        mockedUseDownloadPerformanceBreakdownData.mockReturnValue({
            files: {
                'performance-breakdown.csv':
                    'Feature,Automation Rate\nAI Agent,90%',
            },
            fileName: 'performance-breakdown.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
            files: {
                'automation-rate-by-feature.csv':
                    'Feature,Automation rate (%)\nAI Agent,50',
            },
            fileName: 'automation-rate-by-feature.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
            files: {
                'automation-rate-timeseries.csv':
                    'Date,Automation rate (%)\n2024-01-01,50',
            },
            fileName: 'automation-rate-timeseries.csv',
            isLoading: false,
        })
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when KPI data is loading', () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when performance breakdown is loading', () => {
        mockedUseDownloadPerformanceBreakdownData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation rate by feature is loading', () => {
        mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation rate time series is loading', () => {
        mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should call saveZippedFiles when triggerDownload is called', async () => {
        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining('analytics-overview'),
        )
    })

    it('should only pass KPI sections to useDashboardData', () => {
        renderHook(() => useExportAnalyticsOverviewToCSV())

        const [dashboardArg] = mockedUseDashboardData.mock.calls[0]
        const passedConfigIds = (
            dashboardArg.children as DashboardSectionSchema[]
        ).flatMap((section) =>
            (section.children as DashboardChartSchema[]).map(
                (child) => child.config_id,
            ),
        )

        const nonKpiConfigIds = DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections
            .filter((section) => section.type !== 'kpis')
            .flatMap((section) => section.items.map((item) => item.chartId))

        nonKpiConfigIds.forEach((id) => {
            expect(passedConfigIds).not.toContain(id)
        })
    })

    it('should include KPI trends, charts and table files in the ZIP', async () => {
        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(4)
        expect(
            fileNames.some((name) => name.includes('analytics-overview')),
        ).toBe(true)
        expect(
            fileNames.some((name) => name.includes('performance-breakdown')),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('automation-rate-by-feature'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('automation-rate-timeseries'),
            ),
        ).toBe(true)
    })
})
