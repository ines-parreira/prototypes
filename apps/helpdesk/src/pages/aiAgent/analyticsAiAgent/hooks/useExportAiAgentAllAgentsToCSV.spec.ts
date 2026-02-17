import * as fileUtils from '@repo/utils'
import { act, renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { useAiAgentAutomatedInteractionsMetric } from './useAiAgentAutomatedInteractionsMetric'
import { useAiAgentAutomationRateMetric } from './useAiAgentAutomationRateMetric'
import { useAiAgentTimeSavedMetric } from './useAiAgentTimeSavedMetric'
import { useDownloadAiAgentAutomationRateTimeSeriesData } from './useDownloadAiAgentAutomationRateTimeSeriesData'
import { useDownloadAutomatedInteractionsBySkillData } from './useDownloadAutomatedInteractionsBySkillData'
import { useDownloadChannelPerformanceData } from './useDownloadChannelPerformanceData'
import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'
import { useExportAiAgentAllAgentsToCSV } from './useExportAiAgentAllAgentsToCSV'
import { useTotalSalesMetric } from './useTotalSalesMetric'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('./useAiAgentAutomationRateMetric')
jest.mock('./useAiAgentAutomatedInteractionsMetric')
jest.mock('./useTotalSalesMetric')
jest.mock('./useAiAgentTimeSavedMetric')
jest.mock('./useDownloadChannelPerformanceData')
jest.mock('./useDownloadIntentPerformanceData')
jest.mock('./useDownloadAutomatedInteractionsBySkillData')
jest.mock('./useDownloadAiAgentAutomationRateTimeSeriesData')
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    saveZippedFiles: jest.fn(),
}))

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseAiAgentAutomationRateMetric = jest.mocked(
    useAiAgentAutomationRateMetric,
)
const mockedUseAiAgentAutomatedInteractionsMetric = jest.mocked(
    useAiAgentAutomatedInteractionsMetric,
)
const mockedUseTotalSalesMetric = jest.mocked(useTotalSalesMetric)
const mockedUseAiAgentTimeSavedMetric = jest.mocked(useAiAgentTimeSavedMetric)
const mockedUseDownloadChannelPerformanceData = jest.mocked(
    useDownloadChannelPerformanceData,
)
const mockedUseDownloadIntentPerformanceData = jest.mocked(
    useDownloadIntentPerformanceData,
)
const mockedUseDownloadAutomatedInteractionsBySkillData = jest.mocked(
    useDownloadAutomatedInteractionsBySkillData,
)
const mockedUseDownloadAiAgentAutomationRateTimeSeriesData = jest.mocked(
    useDownloadAiAgentAutomationRateTimeSeriesData,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAiAgentAllAgentsToCSV', () => {
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

        mockedUseAiAgentAutomationRateMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automation rate',
                value: 0.85,
                prevValue: 0.8,
            },
        })

        mockedUseAiAgentAutomatedInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 3000,
                prevValue: 2500,
            },
        })

        mockedUseTotalSalesMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Total sales',
                value: 50000,
                prevValue: 45000,
            },
        })

        mockedUseAiAgentTimeSavedMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Time saved by agents',
                value: 180000,
                prevValue: 160000,
            },
        })

        mockedUseDownloadAutomatedInteractionsBySkillData.mockReturnValue({
            files: {
                'automated-interactions-by-skill.csv':
                    'Skill,Automated interactions\nSupport,1000',
            },
            fileName: 'automated-interactions-by-skill.csv',
            isLoading: false,
        })

        mockedUseDownloadAiAgentAutomationRateTimeSeriesData.mockReturnValue({
            files: {
                'automation-rate-timeseries.csv':
                    'Date,Automation rate (%)\n2024-01-01,85',
            },
            fileName: 'automation-rate-timeseries.csv',
            isLoading: false,
        })

        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {
                'channel-performance-breakdown.csv':
                    'Channel,Handover interactions\nEmail,100',
            },
            fileName: 'channel-performance-breakdown.csv',
            isLoading: false,
        })

        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {
                'intent-performance-breakdown.csv':
                    'Intent L1,Intent L2,Handover interactions\nOrder,Status,50',
            },
            fileName: 'intent-performance-breakdown.csv',
            isLoading: false,
        })
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when automation rate is loading', () => {
        mockedUseAiAgentAutomationRateMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automated interactions is loading', () => {
        mockedUseAiAgentAutomatedInteractionsMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when total sales is loading', () => {
        mockedUseTotalSalesMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when time saved is loading', () => {
        mockedUseAiAgentTimeSavedMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when channel performance is loading', () => {
        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when intent performance is loading', () => {
        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automated interactions by skill is loading', () => {
        mockedUseDownloadAutomatedInteractionsBySkillData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation rate timeseries is loading', () => {
        mockedUseDownloadAiAgentAutomationRateTimeSeriesData.mockReturnValue({
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
        expect(fileNames.some((name) => name.includes('kpi-cards'))).toBe(true)
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
            fileNames.some((name) =>
                name.includes('channel-performance-breakdown'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('intent-performance-breakdown'),
            ),
        ).toBe(true)
    })
})
