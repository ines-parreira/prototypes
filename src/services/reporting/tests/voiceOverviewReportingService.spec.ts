import moment from 'moment'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {saveReport} from 'services/reporting/voiceOverviewReportingService'

jest.mock('utils/file')

describe('voiceOverviewReportingService', () => {
    const dateSeries: Parameters<typeof saveReport>[1] = {
        end_datetime: '2024-01-15',
        start_datetime: '2024-01-08',
    }
    const data: Parameters<typeof saveReport>[0] = {
        averageWaitTimeTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: null,
                prevValue: 3.727272727272727,
            },
        },
        averageTalkTimeTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: null,
                prevValue: 6.142857142857143,
            },
        },
        totalCallsCountTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 13,
            },
        },
        outboundCallsCountTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 2,
            },
        },
        inboundCallsCountTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 11,
            },
        },
        missedCallsCountTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 6,
            },
        },
    }

    const period = {
        end_datetime: '2024-01-15',
        start_datetime: '2024-01-08',
    }

    it('should call saveReport with a report', async () => {
        const fakeReport = 'someValue'
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(data, dateSeries)

        expect(zipperMock).toHaveBeenCalledWith(
            {
                [`${period.start_datetime}_${
                    period.end_datetime
                }-caller-experience-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                    fakeReport,
                [`${period.start_datetime}_${
                    period.end_datetime
                }-call-volume-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                    fakeReport,
            },
            `${period.start_datetime}_${
                period.end_datetime
            }-voice-call-overview-metrics-${moment().format(DATE_TIME_FORMAT)}`
        )
    })
})
