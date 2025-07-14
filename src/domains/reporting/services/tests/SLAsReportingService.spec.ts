import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { createTimeSeriesPerDimensionReport } from 'domains/reporting/services/SLAsReportingService'
import { createCsv } from 'utils/file'

const period = {
    start_datetime: '2023-06-07',
    end_datetime: '2023-06-14',
}

describe('createTimeSeriesPerDimensionReport', () => {
    const reportLabel = 'some-time-series-data'
    const reportData = [
        ['label a', 'label b'],
        [1, 2],
    ]
    const anotherReportLabel = 'some-other-time-series-data'
    const anotherReportData = [
        ['label z', 'label x'],
        [9, 7],
    ]
    const data = [
        {
            label: reportLabel,
            data: reportData,
        },
        {
            label: anotherReportLabel,
            data: anotherReportData,
        },
    ]

    it('should return formatted reports', () => {
        const reports = createTimeSeriesPerDimensionReport(data, period)

        expect(reports).toEqual({
            files: {
                [getCsvFileNameWithDates(period, reportLabel)]:
                    createCsv(reportData),
                [getCsvFileNameWithDates(period, anotherReportLabel)]:
                    createCsv(anotherReportData),
            },
        })
    })

    it('should return empty object when no data', () => {
        const reports = createTimeSeriesPerDimensionReport([], period)

        expect(reports).toEqual({
            files: {},
        })
    })
})
