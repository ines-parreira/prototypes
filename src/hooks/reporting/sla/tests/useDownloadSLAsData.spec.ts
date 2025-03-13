import { renderHook } from '@testing-library/react-hooks'

import { useTimeSeriesPerDimensionReportData } from 'hooks/reporting/common/useTimeSeriesReportData'
import { useTrendReportData } from 'hooks/reporting/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import {
    SLA_REPORT_FILENAME,
    useDownloadSLAsData,
} from 'hooks/reporting/sla/useDownloadSLAsData'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { ReportingGranularity } from 'models/reporting/types'
import { Period } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock('hooks/reporting/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)
jest.mock('hooks/reporting/common/useTimeSeriesReportData')
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
