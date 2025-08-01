import { assumeMock, renderHook } from '@repo/testing'

import { useTimeSeriesPerDimensionReportData } from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    SLA_REPORT_FILENAME,
    useDownloadSLAsData,
} from 'domains/reporting/hooks/sla/useDownloadSLAsData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { Period } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock('domains/reporting/hooks/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)
jest.mock('domains/reporting/hooks/common/useTimeSeriesReportData')
const useTimeSeriesPerDimensionReportDataMock = assumeMock(
    useTimeSeriesPerDimensionReportData,
)

describe('useDownloadSLAsData', () => {
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

    it('should return formatted report', () => {
        const { result } = renderHook(() => useDownloadSLAsData())

        expect(result.current).toEqual({
            files: {},
            fileName: getCsvFileNameWithDates(period, SLA_REPORT_FILENAME),
            isLoading: false,
        })
    })
})
