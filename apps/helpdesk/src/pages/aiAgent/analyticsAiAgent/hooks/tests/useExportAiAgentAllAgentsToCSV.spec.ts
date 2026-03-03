import { useFlag } from '@repo/feature-flags'
import { act, renderHook } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadAiAgentAutomationRateTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentAutomationRateTimeSeriesData'
import { useDownloadAutomatedInteractionsBySkillData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAutomatedInteractionsBySkillData'
import { useDownloadChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData'
import { useDownloadIntentPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData'
import { useExportAiAgentAllAgentsToCSV } from 'pages/aiAgent/analyticsAiAgent/hooks/useExportAiAgentAllAgentsToCSV'
import { buildKpiDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildKpiDashboard'
import * as fileUtils from 'utils/file'

jest.mock('@repo/feature-flags')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('pages/aiAgent/analyticsOverview/utils/buildKpiDashboard')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAutomatedInteractionsBySkillData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentAutomationRateTimeSeriesData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData',
)
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockUseFlag = jest.mocked(useFlag)
const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedBuildKpiDashboard = jest.mocked(buildKpiDashboard)
const mockedUseDownloadAutomatedInteractionsBySkillData = jest.mocked(
    useDownloadAutomatedInteractionsBySkillData,
)
const mockedUseDownloadAiAgentAutomationRateTimeSeriesData = jest.mocked(
    useDownloadAiAgentAutomationRateTimeSeriesData,
)
const mockedUseDownloadChannelPerformanceData = jest.mocked(
    useDownloadChannelPerformanceData,
)
const mockedUseDownloadIntentPerformanceData = jest.mocked(
    useDownloadIntentPerformanceData,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAiAgentAllAgentsToCSV', () => {
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
                'ai-agent-all-agents - trends.csv': 'trends content',
            },
            fileName: 'ai-agent-all-agents - trends.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomatedInteractionsBySkillData.mockReturnValue({
            files: {
                'automated-interactions-by-skill.csv':
                    'skill,interactions\nSkill A,100',
            },
            fileName: 'automated-interactions-by-skill.csv',
            isLoading: false,
        })

        mockedUseDownloadAiAgentAutomationRateTimeSeriesData.mockReturnValue({
            files: {
                'automation-rate-timeseries.csv':
                    'date,automation_rate\n2024-01-01,85%',
            },
            fileName: 'automation-rate-timeseries.csv',
            isLoading: false,
        })

        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {
                'channel-performance.csv': 'channel,automation_rate\nChat,85%',
            },
            fileName: 'channel-performance.csv',
            isLoading: false,
        })

        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {
                'intent-performance.csv':
                    'intent,automation_rate\nIntent A,90%',
            },
            fileName: 'intent-performance.csv',
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

    it('should return isLoading as true when automated interactions by skill data is loading', () => {
        mockedUseDownloadAutomatedInteractionsBySkillData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation rate time series data is loading', () => {
        mockedUseDownloadAiAgentAutomationRateTimeSeriesData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when channel performance data is loading', () => {
        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when intent performance data is loading', () => {
        mockedUseDownloadIntentPerformanceData.mockReturnValue({
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

    it('should include all expected files in the ZIP', async () => {
        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(5)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('automated-interactions-by-skill'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('automation-rate-timeseries'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) => name.includes('channel-performance')),
        ).toBe(true)
        expect(
            fileNames.some((name) => name.includes('intent-performance')),
        ).toBe(true)
    })

    it('should call buildKpiDashboard with the layout and feature flag value', () => {
        mockUseFlag.mockReturnValue(true)
        renderHook(() => useExportAiAgentAllAgentsToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'ai-agent-all-agents',
            expect.any(Object),
            true,
        )
    })

    it('should handle empty download data files', async () => {
        mockedUseDownloadAutomatedInteractionsBySkillData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        mockedUseDownloadAiAgentAutomationRateTimeSeriesData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(1)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
    })
})
