import { act, renderHook } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as fileUtils from 'utils/file'

import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'
import { useDownloadSupportAgentChannelPerformanceData } from './useDownloadSupportAgentChannelPerformanceData'
import { useDownloadSupportInteractionsByIntentData } from './useDownloadSupportInteractionsByIntentData'
import { useDownloadSupportInteractionsTimeSeriesData } from './useDownloadSupportInteractionsTimeSeriesData'
import { useExportAiAgentSupportAgentToCSV } from './useExportAiAgentSupportAgentToCSV'

jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('./useDownloadSupportInteractionsByIntentData')
jest.mock('./useDownloadSupportInteractionsTimeSeriesData')
jest.mock('./useDownloadSupportAgentChannelPerformanceData')
jest.mock('./useDownloadIntentPerformanceData')
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedUseStatsFilters = jest.mocked(useStatsFilters)
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
                    'intent,interactions\nOrder Status,500',
            },
            isLoading: false,
        })

        mockedUseDownloadSupportInteractionsTimeSeriesData.mockReturnValue({
            files: {
                'support-interactions-timeseries.csv':
                    'date,interactions\n2024-01-01,100',
            },
            isLoading: false,
        })

        mockedUseDownloadSupportAgentChannelPerformanceData.mockReturnValue({
            files: {
                'support-agent-channel-performance.csv':
                    'channel,automation_rate\nEmail,75%',
            },
            fileName: 'support-agent-channel-performance.csv',
            isLoading: false,
        })

        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {
                'intent-performance-breakdown.csv':
                    'Intent L1,Handover interactions\nOrder,50',
            },
            fileName: 'intent-performance-breakdown.csv',
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

    it('should return isLoading as true when support interactions time series is loading', () => {
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
            fileNames.some((name) =>
                name.includes('intent-performance-breakdown'),
            ),
        ).toBe(true)
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
