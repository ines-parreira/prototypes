import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { act, renderHook } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsOverviewReportConfig } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { useDownloadAutomationRateByFeatureData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateByFeatureData'
import { useDownloadAutomationRateTimeSeriesData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateTimeSeriesData'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'
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
    'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateByFeatureData',
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadAutomationRateTimeSeriesData',
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
const mockedBuildCustomDashboard = jest.mocked(buildCustomDashboard)
const mockedUseDownloadAutomationRateByFeatureData = jest.mocked(
    useDownloadAutomationRateByFeatureData,
)
const mockedUseDownloadAutomationRateTimeSeriesData = jest.mocked(
    useDownloadAutomationRateTimeSeriesData,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

const mockPeriod = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-31T23:59:59Z',
}

const dashboardFiles = {
    'analytics-overview - trends.csv': 'trends content',
    'performance-breakdown-2024-01-01_2024-01-31.csv':
        'Feature,Overall automation rate\r\nAI Agent,18%',
}

const byFeatureFiles = {
    'automation-rate-by-feature.csv': 'feature,automation_rate\nFeature A,85%',
}

const timeSeriesFiles = {
    'automation-rate-timeseries.csv': 'date,automation_rate\n2024-01-01,85%',
}

describe('useExportAnalyticsOverviewToCSV', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockReturnValue(false)

        mockedUseGetManagedDashboardsLayoutConfig.mockReturnValue({
            layoutConfig: { sections: [] } as any,
            isLoading: false,
        })

        mockedBuildCustomDashboard.mockReturnValue({
            id: -1,
            name: 'analytics-overview',
            analytics_filter_id: null,
            children: [],
            emoji: null,
        })

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: { period: mockPeriod },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        mockedUseDashboardData.mockReturnValue({
            files: dashboardFiles,
            fileName: 'analytics-overview - trends.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
            files: byFeatureFiles,
            fileName: 'automation-rate-by-feature.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
            files: timeSeriesFiles,
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

        it('should return isLoading as true when automation rate by feature data is loading', () => {
            mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
                files: {},
                fileName: '',
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useExportAnalyticsOverviewToCSV(),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should return isLoading as true when automation rate time series data is loading', () => {
            mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
                files: {},
                fileName: '',
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useExportAnalyticsOverviewToCSV(),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should include dashboard, by-feature and timeseries files in the ZIP', async () => {
            const { result } = renderHook(() =>
                useExportAnalyticsOverviewToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            const fileNames = Object.keys(filesArg)

            expect(fileNames).toHaveLength(4)
            expect(fileNames.some((n) => n.includes('trends'))).toBe(true)
            expect(
                fileNames.some((n) => n.includes('automation-rate-by-feature')),
            ).toBe(true)
            expect(
                fileNames.some((n) => n.includes('automation-rate-timeseries')),
            ).toBe(true)
            expect(
                fileNames.some((n) => n.includes('performance-breakdown')),
            ).toBe(true)
        })

        it('should include only dashboard files when download data files are empty', async () => {
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

            const { result } = renderHook(() =>
                useExportAnalyticsOverviewToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            const fileNames = Object.keys(filesArg)

            expect(fileNames).toHaveLength(2)
            expect(fileNames.some((n) => n.includes('trends'))).toBe(true)
            expect(
                fileNames.some((n) => n.includes('performance-breakdown')),
            ).toBe(true)
        })
    })

    describe('when isNewChartsEnabled is true', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should return isLoading as false even when automation rate data is loading', () => {
            mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
                files: {},
                fileName: '',
                isLoading: true,
            })
            mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
                files: {},
                fileName: '',
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useExportAnalyticsOverviewToCSV(),
            )

            expect(result.current.isLoading).toBe(false)
        })

        it('should include only dashboard files in the ZIP', async () => {
            const { result } = renderHook(() =>
                useExportAnalyticsOverviewToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(filesArg).toEqual(dashboardFiles)
        })
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

    it('should call buildCustomDashboard with the name, layout, and both feature flags', () => {
        mockUseFlag.mockReturnValue(true)

        renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(mockedBuildCustomDashboard).toHaveBeenCalledWith(
            'analytics-overview',
            expect.any(Object),
            true,
            true,
        )
    })

    it('should call useDashboardData with the AnalyticsOverview report config charts', () => {
        renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            true,
            AnalyticsOverviewReportConfig.charts,
        )
    })
})
