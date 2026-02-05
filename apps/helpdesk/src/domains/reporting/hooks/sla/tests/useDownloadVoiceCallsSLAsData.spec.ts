import { assumeMock, renderHook } from '@repo/testing'

import { useTimeSeriesPerDimensionReportData } from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    SLA_REPORT_FILENAME,
    useDownloadVoiceCallsSLAsData,
} from 'domains/reporting/hooks/sla/useDownloadVoiceCallsSLAsData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { Period } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock('domains/reporting/hooks/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)
jest.mock('domains/reporting/hooks/common/useTimeSeriesReportData')
const useTimeSeriesPerDimensionReportDataMock = assumeMock(
    useTimeSeriesPerDimensionReportData,
)

describe('useDownloadVoiceCallsSLAsData', () => {
    const period: Period = {
        start_datetime: '2024-09-14T00:00:00+00:00',
        end_datetime: '2024-09-20T23:59:59+00:00',
    }
    const granularity = ReportingGranularity.Day
    const userTimezone = 'UTC'

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            granularity,
            cleanStatsFilters: { period },
            userTimezone,
        })
        useTrendReportDataMock.mockReturnValue({
            data: [],
            isFetching: false,
        })
        useTimeSeriesPerDimensionReportDataMock.mockReturnValue({
            data: [],
            isFetching: false,
        })
    })

    it('should return formatted report with empty files', () => {
        const { result } = renderHook(() => useDownloadVoiceCallsSLAsData())

        expect(result.current).toEqual({
            files: {},
            fileName: getCsvFileNameWithDates(period, SLA_REPORT_FILENAME),
            isLoading: false,
        })
    })

    it('should return isLoading true when trend data is fetching', () => {
        useTrendReportDataMock.mockReturnValue({
            data: [],
            isFetching: true,
        })

        const { result } = renderHook(() => useDownloadVoiceCallsSLAsData())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading true when time series data is fetching', () => {
        useTimeSeriesPerDimensionReportDataMock.mockReturnValue({
            data: [],
            isFetching: true,
        })

        const { result } = renderHook(() => useDownloadVoiceCallsSLAsData())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return combined files from trend and time series reports', () => {
        const mockTrendData = [
            {
                label: 'Achievement rate',
                value: '95',
                prevValue: '90',
            },
        ]
        const mockTimeSeriesData = [
            {
                label: 'trend',
                data: [
                    ['2024-09-14', 10],
                    ['2024-09-15', 5],
                ],
            },
        ]

        useTrendReportDataMock.mockReturnValue({
            data: mockTrendData,
            isFetching: false,
        })
        useTimeSeriesPerDimensionReportDataMock.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
        })

        const { result } = renderHook(() => useDownloadVoiceCallsSLAsData())

        expect(result.current.files).toBeDefined()
        expect(result.current.fileName).toBe(
            getCsvFileNameWithDates(period, SLA_REPORT_FILENAME),
        )
        expect(result.current.isLoading).toBe(false)
    })
})
