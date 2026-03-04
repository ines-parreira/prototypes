import { useFlag } from '@repo/feature-flags'
import { act, renderHook } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadAutomationRateByFeatureData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateByFeatureData'
import { useDownloadAutomationRateTimeSeriesData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateTimeSeriesData'
import { useDownloadPerformanceBreakdownData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'
import { buildKpiDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildKpiDashboard'
import * as fileUtils from 'utils/file'

jest.mock('@repo/feature-flags')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('pages/aiAgent/analyticsOverview/utils/buildKpiDashboard')
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateByFeatureData',
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateTimeSeriesData',
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData',
)
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockUseFlag = jest.mocked(useFlag)
const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedBuildKpiDashboard = jest.mocked(buildKpiDashboard)
const mockedUseDownloadAutomationRateByFeatureData = jest.mocked(
    useDownloadAutomationRateByFeatureData,
)
const mockedUseDownloadAutomationRateTimeSeriesData = jest.mocked(
    useDownloadAutomationRateTimeSeriesData,
)
const mockedUseDownloadPerformanceBreakdownData = jest.mocked(
    useDownloadPerformanceBreakdownData,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAnalyticsOverviewToCSV', () => {
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
                'analytics-overview - trends.csv': 'trends content',
            },
            fileName: 'analytics-overview - trends.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
            files: {
                'automation-rate-by-feature.csv':
                    'feature,automation_rate\nFeature A,85%',
            },
            fileName: 'automation-rate-by-feature.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
            files: {
                'automation-rate-timeseries.csv':
                    'date,automation_rate\n2024-01-01,85%',
            },
            fileName: 'automation-rate-timeseries.csv',
            isLoading: false,
        })

        mockedUseDownloadPerformanceBreakdownData.mockReturnValue({
            files: {
                'performance-breakdown.csv':
                    'metric,value\nAutomation Rate,85%',
            },
            fileName: 'performance-breakdown.csv',
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

    it('should return isLoading as true when automation rate by feature data is loading', () => {
        mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation rate time series data is loading', () => {
        mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when performance breakdown data is loading', () => {
        mockedUseDownloadPerformanceBreakdownData.mockReturnValue({
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

        expect(mockedSaveZippedFiles).toHaveBeenCalled()
        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining('analytics-overview'),
        )
    })

    it('should include all expected files in the ZIP', async () => {
        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(4)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
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
        expect(
            fileNames.some((name) => name.includes('performance-breakdown')),
        ).toBe(true)
    })

    it('should call buildKpiDashboard with the layout and feature flag value', () => {
        mockUseFlag.mockReturnValue(true)
        renderHook(() => useExportAnalyticsOverviewToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'analytics-overview',
            expect.any(Object),
            true,
        )
    })

    it('should handle empty download data files', async () => {
        mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        mockedUseDownloadPerformanceBreakdownData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(1)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
    })
})
