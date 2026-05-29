import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AnalyticsAiAgentAllAgentsReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { useExportAiAgentAllAgentsToCSV } from 'pages/aiAgent/analyticsAiAgent/hooks/useExportAiAgentAllAgentsToCSV'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import * as fileUtils from 'utils/file'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('pages/aiAgent/analyticsOverview/utils/buildCustomDashboard')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useGetManagedDashboardsLayoutConfig: jest.fn(),
}))
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockedUseAiAgentStatsFilters = jest.mocked(useAiAgentStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedUseGetManagedDashboardsLayoutConfig = jest.mocked(
    useGetManagedDashboardsLayoutConfig,
)
const mockedBuildKpiDashboard = jest.mocked(buildCustomDashboard)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAiAgentAllAgentsToCSV', () => {
    const mockPeriod = {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockedBuildKpiDashboard.mockReturnValue({
            id: 0,
            name: 'ai-agent-all-agents',
            analytics_filter_id: 0,
            children: [],
            emoji: null,
        } as any)

        mockedUseGetManagedDashboardsLayoutConfig.mockReturnValue({
            layoutConfig: { sections: [] } as any,
            isLoading: false,
        })

        mockedUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        mockedUseDashboardData.mockReturnValue({
            files: {
                'ai-agent-all-agents - trends.csv': 'trends content',
                'all-agents-channel-performance.csv': 'channel content',
                'all-agents-intent-performance.csv': 'intent content',
            },
            fileName: 'ai-agent-all-agents - trends.csv',
            isLoading: false,
        })
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when KPI data is loading', () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should call saveZippedFiles when triggerDownload is called', async () => {
        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        expect(mockedSaveZippedFiles).toHaveBeenCalled()
        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining('ai-agent-all-agents'),
        )
    })

    it('should include all expected files in the ZIP when tables flag is enabled', async () => {
        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(3)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('all-agents-channel-performance'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('all-agents-intent-performance'),
            ),
        ).toBe(true)
    })

    it('should call buildCustomDashboard with the name and layout', () => {
        renderHook(() => useExportAiAgentAllAgentsToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'ai-agent-all-agents',
            expect.any(Object),
        )
    })

    it('should call useDashboardData with the AllAgents report config charts', () => {
        renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            AnalyticsAiAgentAllAgentsReportConfig.charts,
        )
    })

    it('should handle empty download data files', async () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]

        expect(Object.keys(filesArg).length).toBe(0)
    })
})
