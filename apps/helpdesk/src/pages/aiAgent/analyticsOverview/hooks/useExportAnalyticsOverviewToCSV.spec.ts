import { act, renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as fileUtils from 'utils/file'

import { useAutomatedInteractionsMetric } from './useAutomatedInteractionsMetric'
import { useAutomationRateMetric } from './useAutomationRateMetric'
import { useCostSavedMetric } from './useCostSavedMetric'
import { useDownloadAutomationRateByFeatureData } from './useDownloadAutomationRateByFeatureData'
import { useDownloadAutomationRateTimeSeriesData } from './useDownloadAutomationRateTimeSeriesData'
import { useDownloadPerformanceBreakdownData } from './useDownloadPerformanceBreakdownData'
import { useExportAnalyticsOverviewToCSV } from './useExportAnalyticsOverviewToCSV'
import { useTimeSavedMetric } from './useTimeSavedMetric'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('./useAutomationRateMetric')
jest.mock('./useAutomatedInteractionsMetric')
jest.mock('./useTimeSavedMetric')
jest.mock('./useCostSavedMetric')
jest.mock('./useDownloadPerformanceBreakdownData')
jest.mock('./useDownloadAutomationRateByFeatureData')
jest.mock('./useDownloadAutomationRateTimeSeriesData')
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseAutomationRateMetric = jest.mocked(useAutomationRateMetric)
const mockedUseAutomatedInteractionsMetric = jest.mocked(
    useAutomatedInteractionsMetric,
)
const mockedUseTimeSavedMetric = jest.mocked(useTimeSavedMetric)
const mockedUseCostSavedMetric = jest.mocked(useCostSavedMetric)
const mockedUseDownloadPerformanceBreakdownData = jest.mocked(
    useDownloadPerformanceBreakdownData,
)
const mockedUseDownloadAutomationRateByFeatureData = jest.mocked(
    useDownloadAutomationRateByFeatureData,
)
const mockedUseDownloadAutomationRateTimeSeriesData = jest.mocked(
    useDownloadAutomationRateTimeSeriesData,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAnalyticsOverviewToCSV', () => {
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

        mockedUseAutomationRateMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Overall automation rate',
                value: 0.9,
                prevValue: 0.85,
            },
        })

        mockedUseAutomatedInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 5000,
                prevValue: 4500,
            },
        })

        mockedUseTimeSavedMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Time saved by agents',
                value: 360000,
                prevValue: 324000,
            },
        })

        mockedUseCostSavedMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Cost saved',
                value: 5000,
                prevValue: 4500,
            },
        })

        mockedUseDownloadPerformanceBreakdownData.mockReturnValue({
            files: {
                'performance-breakdown.csv':
                    'Feature,Automation Rate\nAI Agent,90%',
            },
            fileName: 'performance-breakdown.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateByFeatureData.mockReturnValue({
            files: {
                'automation-rate-by-feature.csv':
                    'Feature,Automation rate (%)\nAI Agent,50',
            },
            fileName: 'automation-rate-by-feature.csv',
            isLoading: false,
        })

        mockedUseDownloadAutomationRateTimeSeriesData.mockReturnValue({
            files: {
                'automation-rate-timeseries.csv':
                    'Date,Automation rate (%)\n2024-01-01,50',
            },
            fileName: 'automation-rate-timeseries.csv',
            isLoading: false,
        })
    })

    it('should return isLoading as false when data is loaded', () => {
        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when automation rate is loading', () => {
        mockedUseAutomationRateMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automated interactions is loading', () => {
        mockedUseAutomatedInteractionsMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when time saved is loading', () => {
        mockedUseTimeSavedMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when cost saved is loading', () => {
        mockedUseCostSavedMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when performance breakdown is loading', () => {
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

    it('should include KPI cards and chart files in the ZIP', async () => {
        const { result } = renderHook(() => useExportAnalyticsOverviewToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(4)
        expect(fileNames.some((name) => name.includes('kpi-cards'))).toBe(true)
        expect(
            fileNames.some((name) => name.includes('performance-breakdown')),
        ).toBe(true)
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
    })
})
