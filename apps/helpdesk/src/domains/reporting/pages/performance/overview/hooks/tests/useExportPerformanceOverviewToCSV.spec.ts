import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useExportPerformanceOverviewToCSV } from 'domains/reporting/pages/performance/overview/hooks/useExportPerformanceOverviewToCSV'
import { PerformanceOverviewReportConfig } from 'domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig'
import * as fileUtils from 'utils/file'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useGetManagedDashboardsLayoutConfig: jest.fn(),
}))
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedUseGetManagedDashboardsLayoutConfig = jest.mocked(
    useGetManagedDashboardsLayoutConfig,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

const mockPeriod = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-31T23:59:59Z',
}

const dashboardFiles = {
    'performance-overview - trends.csv': 'trends content',
}

describe('useExportPerformanceOverviewToCSV', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseGetManagedDashboardsLayoutConfig.mockReturnValue({
            layoutConfig: { sections: [] } as any,
            isLoading: false,
        })

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: { period: mockPeriod },
        } as any)

        mockedUseDashboardData.mockReturnValue({
            files: dashboardFiles,
            fileName: 'performance-overview - trends.csv',
            isLoading: false,
        })
    })

    it('returns isLoading as false when dashboard data is loaded', () => {
        const { result } = renderHook(() => useExportPerformanceOverviewToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('returns isLoading as true when dashboard data is loading', () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportPerformanceOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('passes the PerformanceOverview report config charts to useDashboardData', () => {
        renderHook(() => useExportPerformanceOverviewToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            false,
            PerformanceOverviewReportConfig.charts,
        )
    })

    it('zips the dashboard files with a performance-overview filename', async () => {
        const { result } = renderHook(() => useExportPerformanceOverviewToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            dashboardFiles,
            expect.stringContaining('performance-overview'),
        )
    })
})
