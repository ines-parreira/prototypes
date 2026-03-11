import { useFlag } from '@repo/feature-flags'
import { act, renderHook } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsAiAgentSupportAgentReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import { useDownloadIntentPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData'
import { useDownloadSupportAgentChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentChannelPerformanceData'
import { useDownloadSupportInteractionsByIntentData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsByIntentData'
import { useDownloadSupportInteractionsTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsTimeSeriesData'
import { useExportAiAgentSupportAgentToCSV } from 'pages/aiAgent/analyticsAiAgent/hooks/useExportAiAgentSupportAgentToCSV'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import * as fileUtils from 'utils/file'

jest.mock('@repo/feature-flags')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('pages/aiAgent/analyticsOverview/utils/buildCustomDashboard')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsByIntentData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsTimeSeriesData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentChannelPerformanceData',
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
const mockedBuildKpiDashboard = jest.mocked(buildCustomDashboard)
const mockedUseDownloadSupportInteractionsByIntentData = jest.mocked(
    useDownloadSupportInteractionsByIntentData,
)
const mockedUseDownloadSupportInteractionsTimeSeriesData = jest.mocked(
    useDownloadSupportInteractionsTimeSeriesData,
)
const mockedUseDownloadSupportAgentChannelPerformanceData = jest.mocked(
    useDownloadSupportAgentChannelPerformanceData,
)
const mockedUseDownloadIntentPerformanceData = jest.mocked(
    useDownloadIntentPerformanceData,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAiAgentSupportAgentToCSV', () => {
    const mockPeriod = {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockReturnValue(true)

        mockedBuildKpiDashboard.mockReturnValue({
            id: 0,
            name: 'ai-agent-support-agent',
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
            files: {
                'ai-agent-support-agent - trends.csv': 'trends content',
            },
            fileName: 'ai-agent-support-agent - trends.csv',
            isLoading: false,
        })

        mockedUseDownloadSupportInteractionsByIntentData.mockReturnValue({
            files: {
                'support-interactions-by-intent.csv':
                    'intent,interactions\nIntent A,100',
            },
            isLoading: false,
        })

        mockedUseDownloadSupportInteractionsTimeSeriesData.mockReturnValue({
            files: {
                'support-interactions-timeseries.csv':
                    'date,interactions\n2024-01-01,500',
            },
            isLoading: false,
        })

        mockedUseDownloadSupportAgentChannelPerformanceData.mockReturnValue({
            files: {
                'support-agent-channel-performance.csv':
                    'channel,automation_rate\nChat,85%',
            },
            fileName: 'support-agent-channel-performance.csv',
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
        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when KPI data is loading', () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when support interactions by intent data is loading', () => {
        mockedUseDownloadSupportInteractionsByIntentData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when support interactions time series data is loading', () => {
        mockedUseDownloadSupportInteractionsTimeSeriesData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when channel performance data is loading', () => {
        mockedUseDownloadSupportAgentChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when intent performance data is loading', () => {
        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should call saveZippedFiles when triggerDownload is called', async () => {
        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        expect(mockedSaveZippedFiles).toHaveBeenCalled()
        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining('ai-agent-support-agent'),
        )
    })

    it('should include all expected files in the ZIP', async () => {
        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(5)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('support-interactions-by-intent'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('support-interactions-timeseries'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('support-agent-channel-performance'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) => name.includes('intent-performance')),
        ).toBe(true)
    })

    it('should call buildCustomDashboard with the layout and feature flag value', () => {
        mockUseFlag.mockReturnValue(true)
        renderHook(() => useExportAiAgentSupportAgentToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'ai-agent-support-agent',
            expect.any(Object),
            true,
        )
    })

    it('should call useDashboardData with the SupportAgent report config charts', () => {
        renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            true,
            AnalyticsAiAgentSupportAgentReportConfig.charts,
        )
    })

    it('should handle empty download data files', async () => {
        mockedUseDownloadSupportInteractionsByIntentData.mockReturnValue({
            files: {},
            isLoading: false,
        })

        mockedUseDownloadSupportInteractionsTimeSeriesData.mockReturnValue({
            files: {},
            isLoading: false,
        })

        mockedUseDownloadSupportAgentChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(1)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
    })
})
