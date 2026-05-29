import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { AnalyticsOverviewReportConfig } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import * as fileUtils from 'utils/file'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useGetManagedDashboardsLayoutConfig: jest.fn(),
}))
jest.mock('pages/aiAgent/analyticsOverview/utils/buildCustomDashboard')
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockedUseAiAgentStatsFilters = jest.mocked(useAiAgentStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedUseGetManagedDashboardsLayoutConfig = jest.mocked(
    useGetManagedDashboardsLayoutConfig,
)
const mockedBuildCustomDashboard = jest.mocked(buildCustomDashboard)
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

describe('useExportAnalyticsOverviewToCSV', () => {
    beforeEach(() => {
        jest.clearAllMocks()

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

        mockedUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: { period: mockPeriod },
        } as any)

        mockedUseDashboardData.mockReturnValue({
            files: dashboardFiles,
            fileName: 'analytics-overview - trends.csv',
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

    it('should include dashboard files in the ZIP', async () => {
        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        expect(filesArg).toEqual(dashboardFiles)
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

    it('should call buildCustomDashboard with the name and layout', () => {
        renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(mockedBuildCustomDashboard).toHaveBeenCalledWith(
            'analytics-overview',
            expect.any(Object),
        )
    })

    it('should call useDashboardData with the AnalyticsOverview report config charts', () => {
        renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            AnalyticsOverviewReportConfig.charts,
        )
    })
})
