import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { AnalyticsOverviewReportConfig } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import * as fileUtils from 'utils/file'

jest.mock('@repo/feature-flags')
jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig',
)
jest.mock('pages/aiAgent/analyticsOverview/utils/buildCustomDashboard')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)
const mockedUseAiAgentStatsFilters = jest.mocked(useAiAgentStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedUseGetManagedDashboardsLayoutConfig = jest.mocked(
    useGetManagedDashboardsLayoutConfig,
)
const mockedBuildCustomDashboard = jest.mocked(buildCustomDashboard)
const mockedUseMoneySavedPerInteractionWithAutomate = jest.mocked(
    useMoneySavedPerInteractionWithAutomate,
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

describe('useExportAnalyticsOverviewToCSV', () => {
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

        mockedUseMoneySavedPerInteractionWithAutomate.mockReturnValue(1)
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when trend cards flag is loading', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
                return { value: false, isLoading: true }
            return { value: false, isLoading: false }
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when tables flag is loading', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTables)
                return { value: false, isLoading: true }
            return { value: false, isLoading: false }
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
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

    it('should call buildCustomDashboard with the name, layout, and both feature flags', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

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
            { costSavedPerInteraction: expect.any(Number) },
        )
    })
})
